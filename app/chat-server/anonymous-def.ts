import { Message, ChatRoomState } from "./definition";

export enum AnonymousStageEnum {
  START = "start",
  CHAT_INTRO = "chat-intro",
  CHAT_STORY = "chat-story",
  END = "end",
}

export interface AnonymousState extends ChatRoomState {
  // 聊天记录
  messageHistory: Message[];
  // 当前阶段
  stage: AnonymousStageEnum;
  // 全部用户
  allUsers: string[];
}

export enum AnonymousCommandEnum {
  SIGN_UP = "/报名",
  START = "/开始",
}
