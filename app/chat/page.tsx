"use client";

import { useState } from "react";
import ChatArea from "@/app/chat/chat-area";
import { Message } from "@/app/lib/definition";
import { chatCompletion } from "@/app/lib/llm";
// import OpenAI from "openai";
// import { AI_SENDER } from "@/app/lib/definition";

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

  // async function aiStreamingMessage(message: Message) {
  //   let newMessageList = [...messageList];
  //   newMessageList.push(message);
  //   setMessageList([...newMessageList]);

  //   // const newAIMessage = await chatCompletion(newMessageList);
  //   // newMessageList.push(newAIMessage);
  //   // setMessageList(newMessageList);
  //   const openai = new OpenAI({
  //     baseURL: "https://openrouter.ai/api/v1",
  //     apiKey:
  //       "sk-*-*",
  //     dangerouslyAllowBrowser: true,
  //   });

  //   const completion = await openai.chat.completions.create({
  //     model: "gpt-4-turbo",
  //     messages: newMessageList.map((message) => ({
  //       role: message.sender === AI_SENDER ? "assistant" : "user",
  //       content: message.content,
  //     })),
  //     stream: true,
  //   });

  //   let content = "";
  //   for await (const chunk of completion) {
  //     content += chunk.choices[0].delta.content;
  //     // console.log(content);
  //     setMessageList([...newMessageList, { content, sender: AI_SENDER }]);
  //   }

  //   newMessageList.push({ content, sender: AI_SENDER });
  //   setMessageList([...newMessageList]);
  // }

  return <ChatArea onSendMessage={aiMessage} messageList={messageList} />;
}
