import { useEffect, useRef, useState, useCallback } from 'react';

export interface WSMessage {
  type: 'log' | 'finding' | 'edge' | 'progress' | 'status';
  data: any;
}

export function useWebSocket(investigationId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const path = investigationId
      ? `/ws/investigations/${investigationId}`
      : `/ws/global`;
    const url = `${protocol}//${host}${path}`;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: WSMessage = JSON.parse(event.data);
        setLastMessage(parsed);
      } catch (e) {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [investigationId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastMessage };
}

