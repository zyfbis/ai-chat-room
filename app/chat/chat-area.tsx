"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useUser } from "@/app/user-context";
import { Message } from "@/app/lib/definition";

interface ChatAreaProps {
  onSendMessage: (message: Message) => Promise<void>;
  messageList: Message[];
}

export default function ChatArea({
  onSendMessage,
  messageList,
}: ChatAreaProps) {
  const { user } = useUser();
  const [inputMessage, setInputMessage] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // 处理发送消息的逻辑
  function sendMessage() {
    if (!inputMessage) {
      return;
    }
    let message: Message = {
      content: inputMessage,
      sender: user?.name || "Anonymous",
    };
    onSendMessage(message);
    setInputMessage("");
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(event.target.value);
  };
  const handleSendClick = () => {
    sendMessage();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  // 在消息列表更新后，自动滚动到底部
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messageList]);

  // 粗略计算行数，用于设置输入框高度
  const computeRows = (text: string) => {
    const lines = text.split("\n");
    let rows = lines.length;
    for (const line of lines) {
      rows += Math.floor(line.length / 80);
    }
    return rows;
  };

  return (
    <div className="h-full flex flex-col pl-4 pr-4 pt-4">
      <div
        className="flex-grow overflow-y-auto border-4 rounded p-2"
        ref={messageContainerRef}
      >
        {/* 聊天消息区，允许滚动 */}
        {/* 这里可以放置聊天消息的组件或元素 */}
        {messageList.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === user?.name ? "text-right" : "text-left"
            }`}
          >
            <div className="text-sm text-gray-500">{message.sender}</div>
            <div className="inline-block p-2 bg-gray-50 rounded whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div
        className="pt-4 pb-4 flex"
        style={{
          height: `${computeRows(inputMessage) * 1.5}rem`, // 1.5rem 是行高
          minHeight: "20%",
          maxHeight: "50%",
        }}
      >
        {/* 输入消息区 */}
        <div className="flex-grow relative">
          <textarea
            className="w-full h-full p-2 border rounded resize-none"
            placeholder="输入消息 Ctrl+Enter 发送"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button
            className="absolute bottom-2 right-4 m-2 p-2 bg-blue-500 text-white rounded"
            onClick={handleSendClick}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
