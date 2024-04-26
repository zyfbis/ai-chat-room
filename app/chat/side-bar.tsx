"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/app/user-context";
import { ChatRoom } from "@/app/chat-server/definition";
import { getChatRoomList, deleteChatRoom } from "@/app/chat-server/data";

export function ChatRoomCard({
  name,
  id,
  updateChatRoomList,
}: {
  name: string;
  id: BigInt;
  updateChatRoomList: () => Promise<void>;
}) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    console.log("delete", id);
    await deleteChatRoom(id);
    await updateChatRoomList();
  }

  return (
    <Link href={`/chat/${id}`}>
      <span className="flex-none block bg-white rounded-lg p-4 mb-4 shadow hover:bg-gray-100 relative">
        {name}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          onClick={handleDelete}
        >
          ×
        </button>
      </span>
    </Link>
  );
}

export default function SideBar() {
  const { user } = useUser();
  const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([]);
  const pathname = usePathname();

  // 更新房间列表
  async function updateChatRoomList() {
    const chatRooms = await getChatRoomList();
    setChatRoomList(chatRooms);
  }
  useEffect(() => {
    updateChatRoomList();
  }, [pathname]); // 当 pathname 变化时，重新获取房间列表

  return (
    <div className="flex flex-col h-full">
      {/* 添加创建房间的按钮 */}
      <div className="flex-none p-4">
        <Link href="/chat/create">
          <button className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
            创建房间
          </button>
        </Link>
      </div>
      {/* 房间卡片列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatRoomList.map((room) => (
          <ChatRoomCard
            key={`${room.id}`}
            id={room.id}
            name={room.name}
            updateChatRoomList={updateChatRoomList}
          />
        ))}
      </div>
      {/* 用户信息 */}
      <div className="p-4">
        <div className="flex-none h-20 flex items-center justify-center text-2xl bg-indigo-100">
          {user?.name}
        </div>
      </div>
    </div>
  );
}
