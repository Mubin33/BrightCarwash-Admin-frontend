"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/lib/auth-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

const getSocketBaseUrl = (): string => {
  const customSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (customSocketUrl) {
    return customSocketUrl.replace(/\/$/, "");
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiUrl) {
    // Safely remove trailing /api or /api/
    return apiUrl.replace(/\/api\/?$/, "");
  }
  return "http://localhost:4000";
};

const baseUrl = getSocketBaseUrl();

export const useNotificationSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (typeof window === "undefined" || !userId) {
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      return;
    }

    const socketInstance = io(`${baseUrl}/notifications`, {
      auth: {
        token: `Bearer ${accessToken}`,
        accessToken: accessToken,
      },
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    queueMicrotask(() => {
      setSocket(socketInstance);
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
