"use client";

import Link from "next/link";
import { useUser } from "@/app/user-context";

interface ChatRoomCardProps {
  name: string;
  roomId: string;
}

export function ChatRoomCard({ name, roomId }: ChatRoomCardProps) {
  return (
    <Link href={`/chat/${roomId}`}>
      <span className="flex-none block bg-white rounded-lg p-4 mb-4 shadow hover:bg-gray-100">
        {name}
      </span>
    </Link>
  );
}

const chatRoomsExample = [
  { name: "聊天室 1", roomId: "1" },
  { name: "聊天室 2", roomId: "2" },
  { name: "聊天室 3", roomId: "3" },
  { name: "聊天室 4", roomId: "4" },
  { name: "聊天室 5", roomId: "5" },
  { name: "聊天室 6", roomId: "6" },
  { name: "聊天室 7", roomId: "7" },
  { name: "聊天室 8", roomId: "8" },
  { name: "聊天室 9", roomId: "9" },
  { name: "聊天室 10", roomId: "10" },
];

export default function SideBar() {
  const { user } = useUser();
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {chatRoomsExample.map((room) => (
          <ChatRoomCard
            key={room.roomId}
            roomId={room.roomId}
            name={room.name}
          />
        ))}
      </div>
      <div className="p-4 ">
        <div className="flex-none h-20 flex items-center justify-center text-2xl bg-indigo-100">
          {user?.name}
        </div>
      </div>
    </div>
  );
}
