import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const WS_URL = "ws://localhost:6001"; // ✅ WebSocket backend URL

interface WebSocketContextType {
  socket: WebSocket | null;
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
    if (socketRef.current) {
      console.warn(
        "[WS] ⚠️ WebSocket is al verbonden. Geen nieuwe verbinding nodig."
      );
      return;
    }

    console.log("[WS] 🔌 Verbinding maken met WebSocket...");
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] ✅ WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (msg) => {
      try {
        const parsedData = JSON.parse(msg.data);
        if (parsedData.event) {
          console.log(
            `[WS] 🔄 Event ontvangen: ${parsedData.event}`,
            parsedData.data
          );
        } else {
          console.warn(
            "[WS] ⚠️ Onbekend WebSocket bericht ontvangen:",
            parsedData
          );
        }
      } catch (error) {
        console.error(
          "[WS] ❌ Fout bij verwerken WebSocket bericht: Geen geldige JSON",
          msg.data
        );
      }
    };

    ws.onclose = (event) => {
      console.warn(
        `[WS] ❌ WebSocket verbroken, reden: ${event.reason || "geen reden opgegeven"}`
      );
      setIsConnected(false);
      socketRef.current = null;

      if (!reconnectTimeoutRef.current) {
        console.log("[WS] 🔄 Probeer opnieuw te verbinden over 5 seconden...");
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (!socketRef.current) {
            console.log("[WS] 🔌 Herstellen WebSocket-verbinding...");
            socketRef.current = new WebSocket(WS_URL);
          }
        }, 5000);
      }
    };

    ws.onerror = (error) => console.error("[WS] ⚠️ WebSocket fout:", error);

    return () => {
      console.log("[WS] 🔌 WebSocket wordt gesloten...");
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
    } else {
      console.warn(
        "[WS] ⚠️ Kan geen bericht verzenden: WebSocket is niet verbonden"
      );
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ socket: socketRef.current, sendMessage }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocket moet binnen WebSocketProvider gebruikt worden"
    );
  }
  return context;
};
