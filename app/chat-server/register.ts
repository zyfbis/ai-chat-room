"use server";

import { Server } from "socket.io";

export default function registerChatServer(io: Server) {
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("a user disconnected");
    });
  });

  console.log("> chat server registered");
}
