import asyncio
import re
from typing import List, Callable, Optional, Tuple
from backend.app.config import settings

SECRET_PATTERNS = [
    re.compile(r'(?i)(api[_-]?key|token|secret|password|bearer\s+)["\':=\s]+([a-zA-Z0-9_\-\.]{8,})'),
]

def redact_sensitive(text: str) -> str:
    """Redacts potential secrets or sensitive tokens from output logs."""
    sanitized = text
    for pattern in SECRET_PATTERNS:
        sanitized = pattern.sub(r'\1: [REDACTED]', sanitized)
    return sanitized

class SafeSubprocessRunner:
    @staticmethod
    async def run(
        command_args: List[str],
        timeout: Optional[int] = None,
        log_callback: Optional[Callable[[str, str], None]] = None,
        stage: str = "Execution",
    ) -> Tuple[int, str, str]:
        """
        Executes a command safely using asyncio.create_subprocess_exec (NO shell=True).
        Streams output lines through log_callback.
        """
        if not command_args or not isinstance(command_args, list):
            raise ValueError("command_args must be a non-empty list of arguments")

        timeout_sec = timeout or settings.SUBPROCESS_TIMEOUT_SECONDS
        executable = command_args[0]

        # Log launch
        if log_callback:
            cmd_preview = " ".join([executable] + [f"'{a}'" if " " in a else a for a in command_args[1:]])
            await log_callback("INFO", f"Executing external tool: {redact_sensitive(cmd_preview)}")

        try:
            process = await asyncio.create_subprocess_exec(
                *command_args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        except FileNotFoundError:
            err = f"Binary not found: {executable}"
            if log_callback:
                await log_callback("ERROR", err)
            return 127, "", err
        except PermissionError:
            err = f"Permission denied executing: {executable}"
            if log_callback:
                await log_callback("ERROR", err)
            return 126, "", err
        except Exception as e:
            err = f"Failed to start process: {str(e)}"
            if log_callback:
                await log_callback("ERROR", err)
            return 1, "", err

        stdout_lines = []
        stderr_lines = []

        async def read_stream(stream, lines_list, level):
            while True:
                line = await stream.readline()
                if not line:
                    break
                decoded = line.decode("utf-8", errors="replace").rstrip()
                if decoded:
                    clean = redact_sensitive(decoded)
                    lines_list.append(clean)
                    if log_callback:
                        await log_callback(level, clean)

        try:
            await asyncio.wait_for(
                asyncio.gather(
                    read_stream(process.stdout, stdout_lines, "INFO"),
                    read_stream(process.stderr, stderr_lines, "WARN"),
                ),
                timeout=timeout_sec,
            )
            await process.wait()
            return (
                process.returncode or 0,
                "\n".join(stdout_lines),
                "\n".join(stderr_lines),
            )
        except asyncio.TimeoutError:
            try:
                process.terminate()
                await asyncio.sleep(0.5)
                if process.returncode is None:
                    process.kill()
            except Exception:
                pass
            timeout_msg = f"Tool execution timed out after {timeout_sec}s: {executable}"
            if log_callback:
                await log_callback("ERROR", timeout_msg)
            return -1, "\n".join(stdout_lines), timeout_msg

