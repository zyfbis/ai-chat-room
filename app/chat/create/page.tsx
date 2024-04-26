"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import {
  AnonymousState,
  AnonymousStageEnum,
} from "@/app/chat-server/anonymous-def";
import { createChatRoom, createChatRoomState } from "@/app/chat-server/data";

const RoomTemplates = ["互助会"];

export default function CreateRoomPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(RoomTemplates[0]);
  const [roomDescription, setRoomDescription] = useState("");

  async function handleCreateRoom(formData: FormData) {
    // 创建房间
    const roomName = `${roomDescription}-${selectedTemplate}`;
    const room = await createChatRoom(roomName);
    const roomId = room.id;

    // 创建房间状态
    console.assert(selectedTemplate === "互助会", "目前只支持互助会");
    const state: AnonymousState = {
      roomId,
      description: roomName,
      messageHistory: [],
      stage: AnonymousStageEnum.START,
      allUsers: [],
    };
    await createChatRoomState(roomId, state);

    // 跳转到房间
    redirect(`/chat/${roomId}`);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">创建房间</h2>
        <form action={handleCreateRoom}>
          <div className="mb-4">
            <label htmlFor="template" className="block mb-2 font-medium">
              选择模板
            </label>
            <select
              id="template"
              className="w-full p-2 border border-gray-300 rounded"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {RoomTemplates.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2 font-medium">
              房间描述
            </label>
            <textarea
              id="description"
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
          >
            创建房间
          </button>
        </form>
      </div>
    </div>
  );
}
