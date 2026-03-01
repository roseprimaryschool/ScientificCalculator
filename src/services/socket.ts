import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(username: string, profilePic?: string) {
    if (this.socket) return;
    
    this.socket = io(window.location.origin);
    
    this.socket.on("connect", () => {
      console.log("Connected to socket server");
      this.socket?.emit("join_chat", { username, profilePic });
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
  }

  getSocket() {
    return this.socket;
  }

  sendMessage(message: string) {
    this.socket?.emit("send_message", message);
  }

  onMessage(callback: (data: any) => void) {
    this.socket?.on("chat_message", callback);
  }

  onSystemMessage(callback: (message: string) => void) {
    this.socket?.on("system_message", callback);
  }

  onRoleAssignment(callback: (data: { role: string, topic: string }) => void) {
    this.socket?.on("role_assignment", callback);
  }

  onGameReset(callback: () => void) {
    this.socket?.on("game_reset", callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
