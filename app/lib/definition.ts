export type User = {
  name: string;
};

export type Message = {
  content: string;
  sender: string;
};

export const AI_SENDER = "AI";

export type ChatRoom = {
  name: string;
  id: BigInt;
};
