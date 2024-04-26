export type User = {
  name: string;
};

export type Message = {
  content: string;
  sender: string;
};

export const AI_SENDER = "AI";
export const SYSTEM_SENDER = "SYSTEM";

export type ChatRoom = {
  name: string;
  id: BigInt;
};

export interface ChatRoomState {
  roomId: BigInt;
  description: string;
}

export function stringifyChatRoomState(state: ChatRoomState): string {
  return JSON.stringify(state, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}

export function parseChatRoomState(stateStr: string): ChatRoomState {
  return JSON.parse(stateStr, (key, value) => {
    if (key === "roomId") {
      return BigInt(value);
    }
    return value;
  });
}
