// context/SocketContext.jsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);
    return () => socketInstance.disconnect();
  }, []);

  const subscribeToFile = (fileId) => {
    if (socket?.connected && fileId) {
      socket.emit('subscribeToFile', { fileId });
    }
  };

  const unsubscribeFromFile = (fileId) => {
    if (socket?.connected && fileId) {
      socket.emit('unsubscribeFromFile', { fileId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, subscribeToFile, unsubscribeFromFile }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
