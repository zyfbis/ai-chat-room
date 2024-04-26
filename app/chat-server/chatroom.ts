import { Mutex } from "async-mutex";
import { Server, Socket } from "socket.io";
import { Message, AI_SENDER, SYSTEM_SENDER } from "./definition";
import {
  SERVER_MESSAGE_ONE,
  SERVER_MESSAGE_ONE_PART,
  SERVER_MESSAGE_ALL,
} from "./constant";
import { getChatRoomState, updateChatRoomState } from "./data";
import { AnonymousState } from "./anonymous-def";
import { AnonymousController } from "./anonymous";

const room_to_online_users = new Map<string, Set<string>>();
const room_to_allow_users = new Map<string, Set<string>>();
const room_to_mutex = new Map<string, Mutex>();
const ALLOW_ALL = "allow_all";

export async function chatroomOnClientLogin(
  io: Server,
  socket: Socket,
  roomId: string,
  userName: string
) {
  console.log(`chatroom ${roomId}: ${userName} login`);
  socket.join(roomId);

  // init states for the room
  if (!room_to_mutex.has(roomId)) {
    room_to_mutex.set(roomId, new Mutex());
  }
  if (!room_to_online_users.has(roomId)) {
    room_to_online_users.set(roomId, new Set());
  }
  if (!room_to_allow_users.has(roomId)) {
    room_to_allow_users.set(roomId, new Set());
    room_to_allow_users.get(roomId)!.add(ALLOW_ALL);
  }

  // add user to online users
  let online_users = room_to_online_users.get(roomId);
  online_users!.add(userName);

  // send a welcome message to all users
  const welcomeMessage: Message = {
    content: `${userName} joined the room, online users: ${Array.from(
      online_users!
    ).join(", ")}`,
    sender: SYSTEM_SENDER,
  };
  io.to(roomId).emit(SERVER_MESSAGE_ONE, roomId, welcomeMessage);

  // send login message
  const mutex = room_to_mutex.get(roomId);
  const release = await mutex!.acquire();
  try {
    const state = await getChatRoomState(BigInt(roomId));
    const controller = new AnonymousController(state as AnonymousState);
    await controller.login(io, socket, roomId, userName);
    const newState = controller.state;
    await updateChatRoomState(BigInt(roomId), newState);
  } finally {
    release();
  }
}

export async function chatroomOnClientLogout(
  io: Server,
  socket: Socket,
  roomId: string,
  userName: string
) {
  console.log(`chatroom ${roomId}: ${userName} logout`);
  socket.leave(roomId);

  // remove user from online users
  let online_users = room_to_online_users.get(roomId);
  online_users!.delete(userName);

  // send a leave message to all users
  const leaveMessage: Message = {
    content: `${userName} left the room, online users: ${Array.from(
      online_users!
    ).join(", ")}`,
    sender: SYSTEM_SENDER,
  };
  io.to(roomId).emit(SERVER_MESSAGE_ONE, roomId, leaveMessage);

  // send logout message
  const mutex = room_to_mutex.get(roomId);
  const release = await mutex!.acquire();
  try {
    const state = await getChatRoomState(BigInt(roomId));
    const controller = new AnonymousController(state as AnonymousState);
    await controller.logout(io, socket, roomId, userName);
    const newState = controller.state;
    await updateChatRoomState(BigInt(roomId), newState);
  } finally {
    release();
  }
}

export async function chatroomOnClientMessageOne(
  io: Server,
  socket: Socket,
  roomId: string,
  message: Message
) {
  // do nothing
  console.log(`chatroom ${roomId}: ${JSON.stringify(message)}`);

  // check if the user is allowed to send message
  const allow_users = room_to_allow_users.get(roomId);
  const allowed =
    allow_users!.has(ALLOW_ALL) || allow_users!.has(message.sender);
  if (!allowed) {
    const notAllowedMessage: Message = {
      content: "You are not allowed to send message for now",
      sender: SYSTEM_SENDER,
    };
    socket.emit(SERVER_MESSAGE_ONE, roomId, notAllowedMessage);
    return;
  }
  // broadcast the message to all users
  io.to(roomId).emit(SERVER_MESSAGE_ONE, roomId, message);

  // start from here
  // get the mutex for the room
  const mutex = room_to_mutex.get(roomId);
  const release = await mutex!.acquire();
  try {
    const state = await getChatRoomState(BigInt(roomId));
    const controller = new AnonymousController(state as AnonymousState);
    await controller.oneMessage(io, socket, roomId, message, allow_users!);
    const newState = controller.state;
    await updateChatRoomState(BigInt(roomId), newState);
  } finally {
    release();
  }
}

export async function chatroomOnClientMessageAll(
  io: Server,
  socket: Socket,
  roomId: string,
  messageList: Message[]
) {
  // do nothing
  console.warn("chatroom should not receive client message all");
}
