"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/lib/auth-client";
import { refreshAccessToken } from "@/lib/token-refresh";

export interface SocketAuthData {
  token: string;
  accessToken: string;
  authorization: string;
}

export const getSocketAuthData = (token: string | null | undefined): SocketAuthData => {
  const currentToken = token || "";
  return {
    token: currentToken,
    accessToken: currentToken,
    authorization: currentToken ? `Bearer ${currentToken}` : "",
  };
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const getSocketBaseUrl = (): string => {
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
      auth: (cb: (data: object) => void) => {
        const currentToken = getAccessToken();
        cb(getSocketAuthData(currentToken));
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      autoConnect: true,
    });

    let isRefreshingSocket = false;

    socketInstance.on("connect_error", async (error: Error) => {
      const errorMessage = error?.message?.toLowerCase() || "";
      const isAuthError =
        errorMessage.includes("auth") ||
        errorMessage.includes("token") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("jwt") ||
        errorMessage.includes("forbidden");

      if (isAuthError && !isRefreshingSocket) {
        isRefreshingSocket = true;
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            socketInstance.auth = (cb: (data: object) => void) => {
              cb(getSocketAuthData(newToken));
            };
            socketInstance.connect();
          }
        } catch (refreshErr) {
          console.warn("WebSocket reconnection token refresh failed:", refreshErr);
        } finally {
          isRefreshingSocket = false;
        }
      }
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
