import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Socket } from "socket.io";
import { Message, AI_SENDER } from "../lib/definition";
import {
  // CLIENT_MESSAGE_ONE,
  // CLIENT_MESSAGE_ALL,
  SERVER_MESSAGE_ONE,
  SERVER_MESSAGE_ONE_PART,
  SERVER_MESSAGE_ALL,
} from "./constant";

const openai = new OpenAI();
const ROOM_ID = "Chatbot";

export async function chatbotOnClientMessageAll(
  socket: Socket,
  messageList: Message[]
) {
  // 更新全部消息
  socket.emit(SERVER_MESSAGE_ALL, ROOM_ID, messageList);

  let oaiMessageList = Array<ChatCompletionMessageParam>();
  for (const message of messageList) {
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

  const aiMessage: Message = {
    content: "",
    sender: AI_SENDER,
  };
  // 创建一个新的空的AI消息
  socket.emit(SERVER_MESSAGE_ONE, ROOM_ID, aiMessage);

  let content = "";
  for await (const chunk of completion) {
    const newPart = chunk.choices[0].delta.content;
    content += newPart;
    // 发送部分AI消息更新
    socket.emit(SERVER_MESSAGE_ONE_PART, ROOM_ID, newPart);
  }
  aiMessage.content = content;

  // 更新全部消息
  messageList.push(aiMessage);
  socket.emit(SERVER_MESSAGE_ALL, ROOM_ID, messageList);
}

export async function chatbotOnClientMessageOne(
  socket: Socket,
  message: Message
) {
  // do nothing
  console.log("chatbot should not receive client message one");
}
