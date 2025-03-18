import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:6001";

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectWebSocket = () => {
      if (socketRef.current) {
        return;
      }

      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (msg) => {
        try {
          const parsedData = JSON.parse(msg.data);
          if (parsedData.event) {
            // Handle the event data here if needed
          }
        } catch (error) {
          console.error("[WS] Failed to process message:", msg.data);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;

        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (!socketRef.current) {
              connectWebSocket();
            }
          }, 5000);
        }
      };

      ws.onerror = (error) => console.error("[WS] WebSocket error:", error);
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, data }));
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ socket: socketRef.current, isConnected, sendMessage }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider.");
  }
  return context;
};
