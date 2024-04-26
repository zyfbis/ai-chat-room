import { Server } from "socket.io";
import { Message } from "./definition";
import {
  CLIENT_LOGIN,
  CLIENT_LOGOUT,
  CLIENT_MESSAGE_ONE,
  CLIENT_MESSAGE_ALL,
} from "./constant";
import {
  chatbotOnClientLogin,
  chatbotOnClientLogout,
  chatbotOnClientMessageOne,
  chatbotOnClientMessageAll,
} from "./chatbot";
import {
  chatroomOnClientLogin,
  chatroomOnClientLogout,
  chatroomOnClientMessageOne,
  chatroomOnClientMessageAll,
} from "./chatroom";

export default function registerChatServer(io: Server) {
  io.on("connection", (socket) => {
    // console.log("a user connected");

    socket.on("disconnect", () => {
      // console.log("a user disconnected");
    });

    socket.on(CLIENT_LOGIN, (roomId: string, userName: string) => {
      if (roomId === "Chatbot") {
        chatbotOnClientLogin(socket, userName);
      } else {
        chatroomOnClientLogin(io, socket, roomId, userName);
      }
    });

    socket.on(CLIENT_LOGOUT, (roomId: string, userName: string) => {
      if (roomId === "Chatbot") {
        chatbotOnClientLogout(socket, userName);
      } else {
        chatroomOnClientLogout(io, socket, roomId, userName);
      }
    });

    socket.on(CLIENT_MESSAGE_ONE, (roomId: string, message: Message) => {
      if (roomId === "Chatbot") {
        chatbotOnClientMessageOne(socket, message);
      } else {
        chatroomOnClientMessageOne(io, socket, roomId, message);
      }
    });

    socket.on(CLIENT_MESSAGE_ALL, (roomId: string, messageList: Message[]) => {
      if (roomId === "Chatbot") {
        chatbotOnClientMessageAll(socket, messageList);
      } else {
        chatroomOnClientMessageAll(io, socket, roomId, messageList);
      }
    });
  });

  console.log("> chat server registered");
}
