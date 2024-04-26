"use server";

import Database from "better-sqlite3";
import { ChatRoom, ChatRoomState } from "./definition";
import { stringifyChatRoomState, parseChatRoomState } from "./definition";
// import { unstable_noStore as noStore } from "next/cache";

const db = new Database("ai-chat-room.sqlite");

// create chat room table
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_room (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`);

export async function createChatRoom(name: string): Promise<ChatRoom> {
  // noStore();
  const stmt = db.prepare("INSERT INTO chat_room (name) VALUES (?)");
  const info = stmt.run(name);
  return { id: BigInt(info.lastInsertRowid), name };
}

export async function getChatRoom(id: BigInt): Promise<ChatRoom> {
  // noStore();
  const stmt = db.prepare("SELECT * FROM chat_room WHERE id = ?");
  const cr = stmt.get(id);
  return cr as ChatRoom;
}

export async function getChatRoomList(): Promise<ChatRoom[]> {
  // noStore();
  const stmt = db.prepare("SELECT * FROM chat_room ORDER BY id DESC");
  const chatRoomList = stmt.all();
  return chatRoomList.map((cr) => cr as ChatRoom);
}

export async function deleteChatRoom(id: BigInt) {
  // noStore();
  const stmt = db.prepare("DELETE FROM chat_room WHERE id = ?");
  stmt.run(id);
}

// create chat room state table
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_room_state (
    id INTEGER PRIMARY KEY,
    room_id INTEGER NOT NULL,
    state TEXT NOT NULL,
    UNIQUE(room_id)
  );
`);

export async function createChatRoomState(
  roomId: BigInt,
  state: ChatRoomState
) {
  // noStore();
  let stateStr = stringifyChatRoomState(state);
  const stmt = db.prepare(
    "INSERT INTO chat_room_state (room_id, state) VALUES (?, ?)"
  );
  stmt.run(roomId, stateStr);
}

export async function getChatRoomState(roomId: BigInt): Promise<ChatRoomState> {
  // noStore();
  const stmt = db.prepare(
    "SELECT state FROM chat_room_state WHERE room_id = ?"
  );
  const r = stmt.get(roomId);
  const rr = r as {
    id: BigInt;
    room_id: BigInt;
    state: string;
  };
  const state = rr.state;
  return parseChatRoomState(state);
}

export async function updateChatRoomState(
  roomId: BigInt,
  state: ChatRoomState
) {
  // noStore();
  let stateStr = stringifyChatRoomState(state);
  const stmt = db.prepare(
    "UPDATE chat_room_state SET state = ? WHERE room_id = ?"
  );
  stmt.run(stateStr, roomId);
}

export async function deleteChatRoomState(roomId: BigInt) {
  // noStore();
  const stmt = db.prepare("DELETE FROM chat_room_state WHERE room_id = ?");
  stmt.run(roomId);
}
