import asyncio
import httpx
import re
import json
import uuid
import datetime
from typing import List, Dict, Any, Callable
from backend.app.core.subprocess_runner import SafeSubprocessRunner
from backend.app.core.tool_manager import ToolManager
from backend.app.models import Finding, EvidenceEdge

# Comprehensive 110+ Public Platforms Catalog across Social, Tech, Media, Creative & Gaming
PLATFORMS_CATALOG = [
    # --- Major Social Networks ---
    {"platform": "Instagram", "category": "Social & Media", "url_template": "https://www.instagram.com/{username}/", "check_type": "body_presence", "must_not_have": "Sorry, this page isn't available."},
    {"platform": "GitHub", "category": "Developer", "url_template": "https://github.com/{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "Not Found"},
    {"platform": "Pinterest", "category": "Social & Media", "url_template": "https://www.pinterest.com/{username}/", "check_type": "status_code", "expected_code": 200, "not_found_string": "User not found"},
    {"platform": "Facebook Public", "category": "Social", "url_template": "https://www.facebook.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "X (Twitter)", "category": "Social", "url_template": "https://x.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Reddit", "category": "Social & Forums", "url_template": "https://www.reddit.com/user/{username}/about.json", "profile_url": "https://www.reddit.com/user/{username}", "check_type": "json_reddit"},
    {"platform": "TikTok", "category": "Video & Social", "url_template": "https://www.tiktok.com/@{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "Couldn't find this account"},
    {"platform": "YouTube", "category": "Video & Media", "url_template": "https://www.youtube.com/@{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "404 Not Found"},
    {"platform": "Threads", "category": "Social", "url_template": "https://www.threads.net/@{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "Page Not Found"},
    {"platform": "Telegram", "category": "Messaging", "url_template": "https://t.me/{username}", "check_type": "body_presence", "must_have": "tgme_page_extra", "must_not_have": "If you have <strong>Telegram</strong>, you can contact"},
    {"platform": "Snapchat", "category": "Social", "url_template": "https://www.snapchat.com/add/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "LinkedIn Public", "category": "Professional", "url_template": "https://www.linkedin.com/in/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Tumblr", "category": "Blogging", "url_template": "https://{username}.tumblr.com", "check_type": "status_code", "expected_code": 200},
    {"platform": "Bluesky", "category": "Social", "url_template": "https://bsky.app/profile/{username}.bsky.social", "check_type": "status_code", "expected_code": 200},
    {"platform": "Mastodon Social", "category": "Social", "url_template": "https://mastodon.social/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "VKontakte", "category": "Social", "url_template": "https://vk.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Flickr", "category": "Photography", "url_template": "https://www.flickr.com/people/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Linktree", "category": "Bio Link", "url_template": "https://linktr.ee/{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "The page you're looking for doesn't exist"},
    {"platform": "Bio.link", "category": "Bio Link", "url_template": "https://bio.link/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Beacons.ai", "category": "Bio Link", "url_template": "https://beacons.ai/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Carrd", "category": "Portfolio", "url_template": "https://{username}.carrd.co", "check_type": "status_code", "expected_code": 200},

    # --- Developer, Code & Data Science ---
    {"platform": "GitLab", "category": "Developer", "url_template": "https://gitlab.com/{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "The page you're looking for could not be found"},
    {"platform": "DockerHub", "category": "Developer", "url_template": "https://hub.docker.com/v2/users/{username}/", "profile_url": "https://hub.docker.com/u/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "HackerNews", "category": "Developer & Tech", "url_template": "https://news.ycombinator.com/user?id={username}", "check_type": "body_presence", "must_have": "user: {username}", "must_not_have": "No such user."},
    {"platform": "Dev.to", "category": "Developer", "url_template": "https://dev.to/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "PyPI", "category": "Developer", "url_template": "https://pypi.org/user/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "npm", "category": "Developer", "url_template": "https://www.npmjs.com/~{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Kaggle", "category": "Data Science", "url_template": "https://www.kaggle.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Bitbucket", "category": "Developer", "url_template": "https://bitbucket.org/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Codeforces", "category": "Competitive Coding", "url_template": "https://codeforces.com/profile/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "LeetCode", "category": "Competitive Coding", "url_template": "https://leetcode.com/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "HackerRank", "category": "Competitive Coding", "url_template": "https://www.hackerrank.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Codecademy", "category": "Education", "url_template": "https://www.codecademy.com/profiles/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Replit", "category": "Developer", "url_template": "https://replit.com/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Codepen", "category": "Developer", "url_template": "https://codepen.io/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Hashnode", "category": "Developer & Blogging", "url_template": "https://hashnode.com/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Hugging Face", "category": "AI & ML", "url_template": "https://huggingface.co/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "SourceForge", "category": "Developer", "url_template": "https://sourceforge.net/u/{username}/profile/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Gitea", "category": "Developer", "url_template": "https://gitea.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Gitee", "category": "Developer", "url_template": "https://gitee.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Launchpad", "category": "Developer", "url_template": "https://launchpad.net/~{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "RubyGems", "category": "Developer", "url_template": "https://rubygems.org/profiles/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Packagist", "category": "Developer", "url_template": "https://packagist.org/users/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Crates.io", "category": "Developer", "url_template": "https://crates.io/users/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Scratch MIT", "category": "Education", "url_template": "https://scratch.mit.edu/users/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Arduino Forum", "category": "Hardware & Tech", "url_template": "https://forum.arduino.cc/u/{username}/summary", "check_type": "status_code", "expected_code": 200},

    # --- Gaming & Streaming ---
    {"platform": "Steam Community", "category": "Gaming", "url_template": "https://steamcommunity.com/id/{username}", "check_type": "body_presence", "must_have": "profile_header", "must_not_have": "The specified profile could not be found"},
    {"platform": "Twitch", "category": "Streaming & Gaming", "url_template": "https://www.twitch.tv/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Chess.com", "category": "Gaming", "url_template": "https://api.chess.com/pub/player/{username}", "profile_url": "https://www.chess.com/member/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Lichess", "category": "Gaming", "url_template": "https://lichess.org/api/user/{username}", "profile_url": "https://lichess.org/@/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Kick", "category": "Streaming", "url_template": "https://kick.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Roblox", "category": "Gaming", "url_template": "https://www.roblox.com/user.aspx?username={username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Xbox Gamertag", "category": "Gaming", "url_template": "https://xboxgamertag.com/search/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "RuneScape", "category": "Gaming", "url_template": "https://apps.runescape.com/runemetrics/app/overview/player/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Speedrun.com", "category": "Gaming", "url_template": "https://www.speedrun.com/user/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "osu!", "category": "Gaming", "url_template": "https://osu.ppy.sh/users/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Pokemon Showdown", "category": "Gaming", "url_template": "https://pokemonshowdown.com/users/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Letterboxd", "category": "Movies & Media", "url_template": "https://letterboxd.com/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Trakt", "category": "Movies & TV", "url_template": "https://trakt.tv/users/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "MyAnimeList", "category": "Anime & Media", "url_template": "https://myanimelist.net/profile/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "AniList", "category": "Anime & Media", "url_template": "https://anilist.co/user/{username}/", "check_type": "status_code", "expected_code": 200},

    # --- Creative, Design & Media ---
    {"platform": "Behance", "category": "Design & Creative", "url_template": "https://www.behance.net/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Dribbble", "category": "Design & Creative", "url_template": "https://dribbble.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "ArtStation", "category": "Design & Art", "url_template": "https://www.artstation.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "DeviantArt", "category": "Design & Art", "url_template": "https://www.deviantart.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "500px", "category": "Photography", "url_template": "https://500px.com/p/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Unsplash", "category": "Photography", "url_template": "https://unsplash.com/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Figma Community", "category": "Design", "url_template": "https://www.figma.com/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Vimeo", "category": "Video & Media", "url_template": "https://vimeo.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Dailymotion", "category": "Video", "url_template": "https://www.dailymotion.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Imgur", "category": "Media", "url_template": "https://imgur.com/user/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Giphy", "category": "Media", "url_template": "https://giphy.com/{username}", "check_type": "status_code", "expected_code": 200},

    # --- Audio & Music ---
    {"platform": "SoundCloud", "category": "Audio & Music", "url_template": "https://soundcloud.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Spotify User", "category": "Audio & Music", "url_template": "https://open.spotify.com/user/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Bandcamp", "category": "Audio & Music", "url_template": "https://bandcamp.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Mixcloud", "category": "Audio & Music", "url_template": "https://www.mixcloud.com/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Last.fm", "category": "Audio & Music", "url_template": "https://www.last.fm/user/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Genius", "category": "Music & Lyrics", "url_template": "https://genius.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "AudioJungle", "category": "Audio", "url_template": "https://audiojungle.net/user/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Freesound", "category": "Audio", "url_template": "https://freesound.org/people/{username}/", "check_type": "status_code", "expected_code": 200},

    # --- Publishing, Writing & Knowledge ---
    {"platform": "Medium", "category": "Blogging & Media", "url_template": "https://medium.com/@{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "Out of the ordinary"},
    {"platform": "Substack", "category": "Publishing", "url_template": "https://{username}.substack.com", "check_type": "status_code", "expected_code": 200},
    {"platform": "WordPress", "category": "Blogging", "url_template": "https://{username}.wordpress.com", "check_type": "status_code", "expected_code": 200},
    {"platform": "LiveJournal", "category": "Blogging", "url_template": "https://{username}.livejournal.com", "check_type": "status_code", "expected_code": 200},
    {"platform": "Wattpad", "category": "Writing", "url_template": "https://www.wattpad.com/user/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Goodreads", "category": "Books", "url_template": "https://www.goodreads.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Wikipedia User", "category": "Knowledge", "url_template": "https://en.wikipedia.org/wiki/User:{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Quora", "category": "Knowledge & Q&A", "url_template": "https://www.quora.com/profile/{username}", "check_type": "status_code", "expected_code": 200},

    # --- Identity, Cryptography & Crowdfunding ---
    {"platform": "Keybase", "category": "Identity & Cryptography", "url_template": "https://keybase.io/{username}", "check_type": "status_code", "expected_code": 200, "not_found_string": "404"},
    {"platform": "Gravatar", "category": "Identity", "url_template": "https://en.gravatar.com/{username}.json", "profile_url": "https://en.gravatar.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "About.me", "category": "Identity", "url_template": "https://about.me/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Patreon", "category": "Crowdfunding", "url_template": "https://www.patreon.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "BuyMeACoffee", "category": "Crowdfunding", "url_template": "https://www.buymeacoffee.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Ko-fi", "category": "Crowdfunding", "url_template": "https://ko-fi.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "TradingView", "category": "Finance", "url_template": "https://www.tradingview.com/u/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Cash App", "category": "Finance", "url_template": "https://cash.app/${username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Venmo", "category": "Finance", "url_template": "https://venmo.com/{username}", "check_type": "status_code", "expected_code": 200},

    # --- Forums, Communities & Utilities ---
    {"platform": "Disqus", "category": "Forums", "url_template": "https://disqus.com/by/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "ProductHunt", "category": "Tech & Products", "url_template": "https://www.producthunt.com/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Strava", "category": "Fitness & Sports", "url_template": "https://www.strava.com/athletes/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Duolingo", "category": "Education", "url_template": "https://www.duolingo.com/profile/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Instructables", "category": "DIY & Tech", "url_template": "https://www.instructables.com/member/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Pastebin", "category": "Text & Code", "url_template": "https://pastebin.com/u/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Archive.org", "category": "Archive & Library", "url_template": "https://archive.org/details/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Couchsurfing", "category": "Travel", "url_template": "https://www.couchsurfing.com/people/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "AllTrails", "category": "Outdoors", "url_template": "https://www.alltrails.com/members/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Geocaching", "category": "Outdoors", "url_template": "https://www.geocaching.com/p/default.aspx?u={username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Trello", "category": "Productivity", "url_template": "https://trello.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Notion Site", "category": "Productivity", "url_template": "https://{username}.notion.site", "check_type": "status_code", "expected_code": 200},
    {"platform": "ThemeForest", "category": "Marketplace", "url_template": "https://themeforest.net/user/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Envato Forum", "category": "Marketplace", "url_template": "https://forums.envato.com/u/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Redbubble", "category": "Merchandise", "url_template": "https://www.redbubble.com/people/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "9GAG", "category": "Entertainment", "url_template": "https://www.9gag.com/u/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Flipboard", "category": "News & Media", "url_template": "https://flipboard.com/@{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "Memrise", "category": "Education", "url_template": "https://www.memrise.com/user/{username}/", "check_type": "status_code", "expected_code": 200},
    {"platform": "Plurk", "category": "Social", "url_template": "https://www.plurk.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "SpaceHey", "category": "Retro Social", "url_template": "https://spacehey.com/{username}", "check_type": "status_code", "expected_code": 200},
    {"platform": "VirusTotal User", "category": "Security", "url_template": "https://www.virustotal.com/gui/user/{username}", "check_type": "status_code", "expected_code": 200},
]

async def check_single_platform(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    p: Dict[str, Any],
    username: str
) -> Dict[str, Any] | None:
    async with semaphore:
        url = p["url_template"].format(username=username)
        profile_url = p.get("profile_url", url).format(username=username)
        start_time = datetime.datetime.utcnow()

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.7",
        }

        try:
            resp = await client.get(url, headers=headers, follow_redirects=True, timeout=7.0)
            latency_ms = int((datetime.datetime.utcnow() - start_time).total_seconds() * 1000)

            found = False
            check_type = p.get("check_type", "status_code")

            if check_type == "status_code":
                if resp.status_code == p.get("expected_code", 200):
                    not_found_str = p.get("not_found_string")
                    if not not_found_str or not_found_str.lower() not in resp.text.lower():
                        found = True
            elif check_type == "json_reddit":
                if resp.status_code == 200:
                    try:
                        data = resp.json()
                        if "data" in data and "name" in data["data"]:
                            found = True
                    except Exception:
                        pass
            elif check_type == "body_presence":
                if resp.status_code == 200:
                    text = resp.text
                    must_have = p.get("must_have", "").format(username=username)
                    must_not_have = p.get("must_not_have", "").format(username=username)
                    if (not must_have or must_have.lower() in text.lower()) and \
                       (not must_not_have or must_not_have.lower() not in text.lower()):
                        found = True

            if found:
                return {
                    "platform": p["platform"],
                    "category": p["category"],
                    "profile_url": profile_url,
                    "status_code": resp.status_code,
                    "latency_ms": latency_ms,
                    "confidence": "HIGH" if resp.status_code == 200 else "MEDIUM",
                }
        except Exception:
            pass
        return None

class UsernameReconModule:
    @classmethod
    async def run(
        cls,
        investigation_id: str,
        username: str,
        log_callback: Callable[[str, str, str], Any],
        finding_callback: Callable[[Dict[str, Any]], Any],
        edge_callback: Callable[[Dict[str, Any]], Any],
        progress_callback: Callable[[int, str, str], Any],
    ):
        await log_callback("INFO", "Initial Verification", f"Starting deep username intelligence across 100+ platforms for '{username}'")
        await progress_callback(5, "Initial Verification", "system")

        # Sanitize username
        clean_user = re.sub(r'[^a-zA-Z0-9_\-\.]', '', username)
        if not clean_user:
            await log_callback("ERROR", "Initial Verification", f"Invalid characters in username: {username}")
            return

        sherlock_exec = ToolManager.get_tool_executable("sherlock")
        maigret_exec = ToolManager.get_tool_executable("maigret")

        tools_status = []
        if sherlock_exec:
            tools_status.append(f"Sherlock ({sherlock_exec})")
        if maigret_exec:
            tools_status.append(f"Maigret ({maigret_exec})")

        if tools_status:
            await log_callback("INFO", "Tool Detection", f"Locally installed CLI engines detected: {', '.join(tools_status)}")
        else:
            await log_callback("WARN", "Tool Detection", "Sherlock and Maigret CLI binaries not in PATH. SIDZ native 100+ platform probe active.")

        # Stage 1: High-Speed Native Async Engine across 110+ Platforms
        await progress_callback(10, "100+ Public Web Reconnaissance", "native_recon_engine")
        await log_callback("INFO", "Social Profile Reconnaissance", f"Dispatching concurrent probes across {len(PLATFORMS_CATALOG)} open web platforms (Instagram, Pinterest, Facebook, GitHub, X, etc.)...")

        target_node_id = f"target:{clean_user}"
        discovered_platforms = set()
        semaphore = asyncio.Semaphore(20)  # 20 concurrent connections

        async with httpx.AsyncClient(timeout=8.0, limits=httpx.Limits(max_keepalive_connections=30, max_connections=40)) as client:
            tasks = [check_single_platform(client, semaphore, p, clean_user) for p in PLATFORMS_CATALOG]
            
            completed_count = 0
            total_tasks = len(tasks)

            for coro in asyncio.as_completed(tasks):
                res = await coro
                completed_count += 1
                
                # Update progress smoothly between 10% and 55%
                if completed_count % 15 == 0:
                    pct = 10 + int((completed_count / total_tasks) * 45)
                    await progress_callback(pct, "100+ Public Web Reconnaissance", "native_recon_engine")

                if res and res["platform"] not in discovered_platforms:
                    discovered_platforms.add(res["platform"])
                    
                    finding = {
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "social",
                        "title": f"Public Profile: {res['platform']}",
                        "value": res["profile_url"],
                        "source_tool": "native_recon_engine",
                        "source_url": res["profile_url"],
                        "confidence": res["confidence"],
                        "raw_data": {
                            "platform": res["platform"],
                            "category": res["category"],
                            "status_code": res["status_code"],
                            "latency_ms": res["latency_ms"],
                            "attribution_note": "Identical username across services indicates naming correlation, not conclusive proof of common individual ownership.",
                        },
                    }
                    await finding_callback(finding)

                    # Relationship Edge
                    edge = {
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "source_id": target_node_id,
                        "target_id": f"profile:{res['platform']}:{clean_user}",
                        "source_label": clean_user,
                        "target_label": f"{res['platform']} ({clean_user})",
                        "relation": "associated_profile",
                        "evidence_tool": "native_recon_engine",
                    }
                    await edge_callback(edge)

                    await log_callback("SUCCESS", "Social Profile Reconnaissance", f"[FOUND] {res['platform']}: {res['profile_url']} ({res['latency_ms']}ms)")

        await progress_callback(60, "Sherlock Deep Web Hunt", "sherlock")

        # Stage 2: Execute Sherlock CLI (queries 400+ websites)
        if sherlock_exec:
            await log_callback("INFO", "Sherlock Deep Hunt", f"Spawning Sherlock CLI process for '{clean_user}' across 400+ websites...")
            cmd = [
                sherlock_exec,
                clean_user,
                "--print-found",
                "--no-check-update",
                "--timeout", "10",
            ]
            async def sherlock_logger(level, msg):
                # parse output lines like: "[+] GitHub: https://github.com/clean_user"
                m = re.match(r'\[\+\]\s*([^:]+):\s*(https?://[^\s]+)', msg)
                if m:
                    platform_name = m.group(1).strip()
                    profile_url = m.group(2).strip()
                    if platform_name not in discovered_platforms:
                        discovered_platforms.add(platform_name)
                        f = {
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "category": "social",
                            "title": f"Sherlock Match: {platform_name}",
                            "value": profile_url,
                            "source_tool": "sherlock",
                            "source_url": profile_url,
                            "confidence": "HIGH",
                            "raw_data": {"platform": platform_name, "tool": "sherlock"},
                        }
                        await finding_callback(f)
                        e = {
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"profile:{platform_name}:{clean_user}",
                            "source_label": clean_user,
                            "target_label": f"{platform_name} ({clean_user})",
                            "relation": "associated_profile",
                            "evidence_tool": "sherlock",
                        }
                        await edge_callback(e)
                await log_callback(level, "Sherlock Runner", msg)

            code, out, err = await SafeSubprocessRunner.run(cmd, timeout=75, log_callback=sherlock_logger)
            if code == 0:
                await log_callback("SUCCESS", "Sherlock Deep Hunt", "Sherlock scan completed.")
            else:
                await log_callback("WARN", "Sherlock Deep Hunt", f"Sherlock process exited with status {code}.")

        # Stage 3: Execute Maigret if available for recursive footprinting
        if maigret_exec:
            await progress_callback(85, "Maigret Dossier Enrichment", "maigret")
            await log_callback("INFO", "Maigret Engine", f"Spawning Maigret CLI for top-tier account verification on '{clean_user}'...")
            
            maigret_cmd = [
                maigret_exec,
                clean_user,
                "--top-sites", "50",
                "--timeout", "8",
                "--no-progressbar",
            ]
            async def maigret_logger(level, msg):
                # parse output lines like: "[+] Platform: https://url"
                m = re.match(r'\[\+\]\s*([^:]+):\s*(https?://[^\s]+)', msg)
                if m:
                    platform_name = m.group(1).strip()
                    profile_url = m.group(2).strip()
                    if platform_name not in discovered_platforms:
                        discovered_platforms.add(platform_name)
                        f = {
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "category": "social",
                            "title": f"Maigret Match: {platform_name}",
                            "value": profile_url,
                            "source_tool": "maigret",
                            "source_url": profile_url,
                            "confidence": "HIGH",
                            "raw_data": {"platform": platform_name, "tool": "maigret"},
                        }
                        await finding_callback(f)
                        e = {
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"profile:{platform_name}:{clean_user}",
                            "source_label": clean_user,
                            "target_label": f"{platform_name} ({clean_user})",
                            "relation": "associated_profile",
                            "evidence_tool": "maigret",
                        }
                        await edge_callback(e)
                await log_callback(level, "Maigret Runner", msg)

            code_m, _, _ = await SafeSubprocessRunner.run(maigret_cmd, timeout=45, log_callback=maigret_logger)
            if code_m == 0:
                await log_callback("SUCCESS", "Maigret Engine", "Maigret verification completed.")

        await progress_callback(95, "Dossier Synthesis", "analysis")
        await log_callback("SUCCESS", "Dossier Synthesis", f"Multi-source reconnaissance complete. Discovered {len(discovered_platforms)} public profiles across the web.")
        await progress_callback(100, "Completed", "system")
