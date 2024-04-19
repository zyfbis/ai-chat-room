"use client";

import { useState } from "react";
import ChatArea from "@/app/chat/chat-area";
import { Message } from "@/app/lib/definition";
import { chatCompletion } from "@/app/lib/llm";

export default function ChatPage() {
  const [messageList, setMessageList] = useState<Message[]>([]);

  async function aiMessage(message: Message) {
    let newMessageList = [...messageList];
    newMessageList.push(message);
    setMessageList([...newMessageList]);

    const newAIMessage = await chatCompletion(newMessageList);
    newMessageList.push(newAIMessage);
    setMessageList([...newMessageList]);
  }

  return <ChatArea onSendMessage={aiMessage} messageList={messageList} />;
}
