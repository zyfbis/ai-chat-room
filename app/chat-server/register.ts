import { Server } from "socket.io";
import { Message } from "../lib/definition";
import { CLIENT_MESSAGE_ONE, CLIENT_MESSAGE_ALL } from "./constant";
import {
  chatbotOnClientMessageAll,
  chatbotOnClientMessageOne,
} from "./chatbot";

export default function registerChatServer(io: Server) {
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("a user disconnected");
    });

    socket.on(CLIENT_MESSAGE_ONE, (roomId: string, message: Message) => {
      if (roomId === "Chatbot") {
        chatbotOnClientMessageOne(socket, message);
      }
    });

    socket.on(CLIENT_MESSAGE_ALL, (roomId: string, messageList: Message[]) => {
      if (roomId === "Chatbot") {
        chatbotOnClientMessageAll(socket, messageList);
      }
    });
  });

  console.log("> chat server registered");
}
