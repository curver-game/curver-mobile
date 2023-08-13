import { MessageToReceive, MessageToSend } from "../types";

class GameWebsocket {
  socket: WebSocket | null = null;
  constructor() {}

  connect() {
    this.socket = new WebSocket("ws://192.168.1.82:8080/ws");
    this.socket.addEventListener("open", () => {
      console.log("connected");
    });
    this.socket.addEventListener("error", (err) => {
      console.log("ws error", err);
    });
    this.socket.addEventListener("close", () => {
      console.log("disconnected");
    });
  }

  sendMessage(message: MessageToSend) {
    if (!this.socket) {
      throw new Error("socket is not connected");
    }

    this.socket.send(JSON.stringify(message));
  }

  sendMessageWithResponse(
    message: MessageToSend,
    messageType: MessageToReceive["type"]
  ) {
    if (!this.socket) {
      throw new Error("socket is not connected");
    }

    return new Promise<Extract<MessageToReceive, { type: typeof messageType }>>(
      (resolve, reject) => {
        this.socket!.addEventListener("message", (event) => {
          const message = JSON.parse(event.data) as MessageToReceive;
          if (message.type === messageType) {
            resolve(message);
          }
        });

        this.socket!.send(JSON.stringify(message));
      }
    );
  }
}

export const gameWebsocket = new GameWebsocket();
