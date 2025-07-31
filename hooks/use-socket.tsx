'use client';

import { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(eventId: string) {
  const [isConnected, setIsConnected] = useState(false);

  const socket = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const socketInstance: Socket = io(process.env.NEXT_PUBLIC_URL!, {
      path: '/ws',
      autoConnect: false, // We will connect manually
    });

    return socketInstance;
  }, []);

  useEffect(() => {
    if (!eventId || !socket) {
      return;
    }

    function onConnect() {
      setIsConnected(true);
      socket.emit('join-event', eventId);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Manually connect
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.emit('leave-event', eventId);
      socket.disconnect();
    };
  }, [eventId, socket]);

  return { socket, isConnected };
}
