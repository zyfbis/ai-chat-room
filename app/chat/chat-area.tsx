"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useUser } from "@/app/user-context";
import { Message, SYSTEM_SENDER } from "@/app/chat-server/definition";
import { socket } from "@/app/chat-server/socket-client";
import {
  CLIENT_LOGIN,
  CLIENT_LOGOUT,
  CLIENT_MESSAGE_ONE,
  CLIENT_MESSAGE_ALL,
  SERVER_MESSAGE_ONE,
  SERVER_MESSAGE_ONE_PART,
  SERVER_MESSAGE_ALL,
} from "@/app/chat-server/constant";

export default function ChatArea({
  roomId,
  events,
}: {
  roomId: string;
  events: string[];
}) {
  const { user } = useUser();
  const [inputMessage, setInputMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // 处理发送消息的逻辑
  function sendMessage() {
    if (!inputMessage) {
      return;
    }
    let message: Message = {
      content: inputMessage,
      sender: user!.name,
    };
    setInputMessage("");

    // 发送socket消息到服务器
    if (events.includes(CLIENT_MESSAGE_ONE)) {
      socket.emit(CLIENT_MESSAGE_ONE, roomId, message);
    }
    if (events.includes(CLIENT_MESSAGE_ALL)) {
      const newMessageList = [...messageList, message];
      socket.emit(CLIENT_MESSAGE_ALL, roomId, newMessageList);
    }
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

  // 连接和断开
  useEffect(() => {
    function onConnect() {
      console.log("socket connected");
    }

    function onDisconnect() {
      console.log("socket disconnected");
    }

    function clientLogin() {
      if (events.includes(CLIENT_LOGIN)) {
        socket.emit(CLIENT_LOGIN, roomId, user!.name);
      }
    }

    function clientLogout() {
      if (events.includes(CLIENT_LOGOUT)) {
        socket.emit(CLIENT_LOGOUT, roomId, user!.name);
      }
    }

    socket.connect(); // no-op if the socket is already connected
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // 等到下面的消息接收函数注册完成
    setTimeout(clientLogin, 0);
    window.addEventListener("beforeunload", clientLogout);

    return () => {
      clientLogout();
      window.removeEventListener("beforeunload", clientLogout);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [roomId, events, user]);

  // 接收socket消息
  useEffect(() => {
    function onServerMessageOne(rid: string, message: Message) {
      // console.log("received server message one", message);
      console.assert(
        rid === roomId,
        `received message from wrong room ${rid} vs ${roomId}`
      );
      // 新增一条消息
      if (events.includes(SERVER_MESSAGE_ONE)) {
        setMessageList([...messageList, message]);
      }
    }

    function onServerMessageOnePart(rid: string, messagePart: string) {
      // console.log("received server message one part", messagePart);
      console.assert(
        rid === roomId,
        `received message from wrong room ${rid} vs ${roomId}`
      );
      // 更新最后一条消息
      if (events.includes(SERVER_MESSAGE_ONE_PART)) {
        let newMessageList = [...messageList];
        let lastMessage = newMessageList.pop();
        if (!lastMessage) {
          console.error("message list is empty");
          lastMessage = { content: "", sender: "" };
        }
        const newLastMessage: Message = {
          content: lastMessage.content + messagePart,
          sender: lastMessage.sender,
        };
        newMessageList.push(newLastMessage);
        setMessageList(newMessageList);
      }
    }

    function onServerMessageAll(rid: string, newMessageList: Message[]) {
      // console.log("received server message all", newMessageList);
      console.assert(
        rid === roomId,
        `received message from wrong room ${rid} vs ${roomId}`
      );
      // 更新全部消息
      if (events.includes(SERVER_MESSAGE_ALL)) {
        setMessageList(newMessageList);
      }
    }

    socket.on(SERVER_MESSAGE_ONE, onServerMessageOne);
    socket.on(SERVER_MESSAGE_ONE_PART, onServerMessageOnePart);
    socket.on(SERVER_MESSAGE_ALL, onServerMessageAll);

    return () => {
      socket.off(SERVER_MESSAGE_ONE, onServerMessageOne);
      socket.off(SERVER_MESSAGE_ONE_PART, onServerMessageOnePart);
      socket.off(SERVER_MESSAGE_ALL, onServerMessageAll);
    };
  }, [roomId, events, messageList]);

  return (
    <div className="flex flex-col h-full pl-4 pr-4 pt-4">
      <div
        className="flex-grow overflow-y-auto border-4 rounded p-2"
        ref={messageContainerRef}
      >
        {/* 聊天消息区，允许滚动 */}
        {/* 这里可以放置聊天消息的组件或元素 */}
        {messageList.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${(() => {
              if (message.sender === SYSTEM_SENDER) {
                return "text-center";
              }
              if (message.sender === user!.name) {
                return "text-right";
              }
              return "text-left";
            })()}`}
          >
            <div className="text-sm text-gray-500">{message.sender}</div>
            <div className="inline-block p-2 bg-gray-50 rounded whitespace-pre-wrap text-left max-w-[80%]">
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
