"use client";

import Link from "next/link";
import { useUser } from "@/app/user-context";
import { ChatRoom } from "@/app/lib/definition";

export function ChatRoomCard({ name, id }: ChatRoom) {
  return (
    <Link href={`/chat/${id}`}>
      <span className="flex-none block bg-white rounded-lg p-4 mb-4 shadow hover:bg-gray-100">
        {name}
      </span>
    </Link>
  );
}

export default function SideBar({
  chatRoomList,
}: {
  chatRoomList: ChatRoom[];
}) {
  const { user } = useUser();
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
          <ChatRoomCard key={`${room.id}`} id={room.id} name={room.name} />
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
