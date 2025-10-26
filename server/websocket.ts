import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import { parse, UrlWithParsedQuery } from "url";
import { Duplex } from "stream";

type WebSocketMessage<T = unknown> = {
  type: string;
  data: T;
};

type ParsedQuery = {
  userId?: string | string[];
};

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      const parsedUrl: UrlWithParsedQuery = parse(request.url || "", true);
      const { pathname, query } = parsedUrl;

      if (pathname === "/api/ws") {
        this.wss!.handleUpgrade(request, socket, head, (ws: WebSocket) => {
          this.wss!.emit("connection", ws, request, query);
        });
      } else {
        socket.destroy();
      }
    });

    this.wss.on("connection", (ws: WebSocket, request: IncomingMessage, query: ParsedQuery) => {
      const userIdParam = query.userId;
      const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

      if (!userId) {
        ws.close();
        return;
      }

      // Add client to the map
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);

      console.log(`WebSocket client connected: ${userId}`);

      ws.on("message", (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(userId, ws, message);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      });

      ws.on("close", () => {
        console.log(`WebSocket client disconnected: ${userId}`);
        const userClients = this.clients.get(userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            this.clients.delete(userId);
          }
        }
      });

      ws.on("error", (error: Error) => {
        console.error("WebSocket error:", error);
      });
    });
  }

  private handleMessage(userId: string, ws: WebSocket, message: WebSocketMessage): void {
    // Handle incoming messages if needed
    console.log(`Received message from ${userId}:`, message);
  }

  sendToUser<T = unknown>(userId: string, type: string, data: T): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify({ type, data });
      userClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  broadcast<T = unknown>(type: string, data: T): void {
    const message = JSON.stringify({ type, data });
    this.clients.forEach((userClients) => {
      userClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    });
  }
}

export const wsManager = new WebSocketManager();