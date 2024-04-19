"use server";

import Database from "better-sqlite3";
import { ChatRoom } from "@/app/lib/definition";
import { unstable_noStore as noStore } from "next/cache";

const db = new Database("ai-chat-room.sqlite");

// create chat room table
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_room (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`);

export async function createChatRoom(name: string): Promise<ChatRoom> {
  noStore();
  const stmt = db.prepare("INSERT INTO chat_room (name) VALUES (?)");
  const info = stmt.run(name);
  return { id: BigInt(info.lastInsertRowid), name };
}

export async function getChatRoom(id: BigInt): Promise<ChatRoom> {
  noStore();
  const stmt = db.prepare("SELECT * FROM chat_room WHERE id = ?");
  const cr = stmt.get(id);
  return cr as ChatRoom;
}

export async function getChatRoomList(): Promise<ChatRoom[]> {
  noStore();
  const stmt = db.prepare("SELECT * FROM chat_room ORDER BY id DESC");
  const chatRoomList = stmt.all();
  return chatRoomList.map((cr) => cr as ChatRoom);
}

export async function deleteChatRoom(id: BigInt) {
  noStore();
  const stmt = db.prepare("DELETE FROM chat_room WHERE id = ?");
  stmt.run(id);
}
