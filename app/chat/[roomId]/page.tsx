import ChatArea from "@/app/chat/chat-area";
import {
  CLIENT_LOGIN,
  CLIENT_LOGOUT,
  CLIENT_MESSAGE_ONE,
  SERVER_MESSAGE_ONE,
  SERVER_MESSAGE_ONE_PART,
  SERVER_MESSAGE_ALL,
} from "@/app/chat-server/constant";

export default function ChatRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const roomId = params.roomId;
  return (
    <ChatArea
      roomId={roomId}
      events={[
        CLIENT_LOGIN,
        CLIENT_LOGOUT,
        CLIENT_MESSAGE_ONE,
        SERVER_MESSAGE_ONE,
        SERVER_MESSAGE_ONE_PART,
        SERVER_MESSAGE_ALL,
      ]}
    />
  );
}
