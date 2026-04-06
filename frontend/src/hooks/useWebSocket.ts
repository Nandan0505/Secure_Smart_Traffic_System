// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';

type MessageHandler = (data: any) => void;

export function useWebSocket(onMessage: MessageHandler) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = () => {
    // Determine the protocol based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use /ws path — Vite proxy routes this to ws://localhost:8000/ws
    ws.current = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.current.onopen = () => {
      console.log('[WS] Connected');
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('[WS] Parse error', e);
      }
    };

    ws.current.onclose = () => {
      console.log('[WS] Disconnected — reconnecting in 3s');
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = (err) => {
      console.error('[WS] Error', err);
      ws.current?.close();
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      ws.current?.close();
    };
  }, []);
}
