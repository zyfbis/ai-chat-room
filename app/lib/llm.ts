"use server";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Message, AI_SENDER } from "@/app/lib/definition";

const openai = new OpenAI();

export async function chatCompletion(messages: Message[]) {
  let oaiMessageList = Array<ChatCompletionMessageParam>();
  for (const message of messages) {
    if (message.sender === AI_SENDER) {
      oaiMessageList.push({ role: "assistant", content: message.content });
    } else {
      oaiMessageList.push({ role: "user", content: message.content });
    }
  }
  const completion = await openai.chat.completions.create({
    model: "mistralai/mixtral-8x22b-instruct",
    messages: oaiMessageList,
    stream: true,
  });

  let content = "";
  for await (const chunk of completion) {
    content += chunk.choices[0].delta.content;
  }
  return { content: content, sender: AI_SENDER };
}
