import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function useWebSocket({ url, onMessage, onOpen, onClose }) {
  const wsRef = useRef(null);
  const clientIdRef = useRef(uuidv4());

  useEffect(() => {
    if (!url) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = (ev) => {
      console.log('WS open');
      if (onOpen) onOpen(ev, clientIdRef.current);
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (onMessage) onMessage(msg, clientIdRef.current);
      } catch (e) {
        console.error('Invalid ws msg', e);
      }
    };

    ws.onclose = (ev) => {
      console.log('WS closed', ev);
      if (onClose) onClose(ev);
      // You may add reconnect logic here
    };

    return () => {
      ws.close();
    };
  }, [url]);

  function send(obj) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify(obj));
  }

  return { send, clientId: clientIdRef.current };
}
