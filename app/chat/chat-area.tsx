interface Message {
  content: string;
  sender: string;
  time?: string;
}

interface MessageList {
  messages: Message[];
}

const messageListExample: MessageList = {
  messages: [
    { content: "Hello, Bob! How have you been lately?", sender: "Alice" },
    {
      content: "Hi Alice, I'm doing great! Thanks for asking. How about you?",
      sender: "Bob",
    },
    {
      content:
        "I'm doing well too. I've been quite busy with work recently, but everything is going smoothly.",
      sender: "Alice",
    },
    {
      content:
        "That's good to hear. I've been working on a new project myself, and it's been taking up a lot of my time.",
      sender: "Bob",
    },
    {
      content: "Oh, what kind of project is it? I'm curious to know more.",
      sender: "Alice",
    },
    {
      content:
        "It's a web application for task management. It allows users to create, assign, and track tasks within a team. I'm really excited about it!",
      sender: "Bob",
    },
    {
      content:
        "That sounds amazing! I'm sure it will be very useful for teams to stay organized and productive.",
      sender: "Alice",
    },
    {
      content:
        "Thanks, Alice. I'm hoping it will make a difference for teams struggling with task management.",
      sender: "Bob",
    },
    {
      content:
        "I have no doubt it will. Let me know if you need any help or feedback during the development process.",
      sender: "Alice",
    },
    {
      content:
        "I appreciate the offer, Alice. I'll definitely reach out if I need any assistance.",
      sender: "Bob",
    },
    {
      content:
        "Great! By the way, I wanted to ask if you're free this weekend. I was thinking we could catch up over coffee or lunch.",
      sender: "Alice",
    },
    {
      content:
        "That sounds wonderful! I don't have any plans yet, so I'm definitely up for meeting up. Just let me know when and where.",
      sender: "Bob",
    },
    {
      content:
        "How about Saturday afternoon at that new cafe downtown? I heard they have amazing pastries and sandwiches.",
      sender: "Alice",
    },
    {
      content:
        "Perfect! I've been wanting to try that place too. Let's plan on meeting there around 2 PM, if that works for you.",
      sender: "Bob",
    },
    {
      content:
        "2 PM on Saturday at the new cafe downtown sounds great. I'm looking forward to catching up with you!",
      sender: "Alice",
    },
    {
      content:
        "Me too, Alice. It's been a while since we've had a chance to sit down and chat.",
      sender: "Bob",
    },
    {
      content:
        "I know, right? Life gets so busy sometimes. But it's important to make time for friends and stay connected.",
      sender: "Alice",
    },
    {
      content:
        "Absolutely. Friends are the ones who keep us grounded and support us through the ups and downs of life.",
      sender: "Bob",
    },
    {
      content:
        "Couldn't agree more. I'm so grateful for our friendship, Bob. See you on Saturday!",
      sender: "Alice",
    },
    {
      content: "See you on Saturday, Alice. Have a great rest of your week!",
      sender: "Bob",
    },
  ],
};

export default function ChatArea() {
  return (
    <div className="h-full flex flex-col pl-4 pr-4 pt-4">
      <div className="flex-grow overflow-y-auto border-4 rounded p-2">
        {/* 聊天消息区，允许滚动 */}
        {/* 这里可以放置聊天消息的组件或元素 */}
        {messageListExample.messages.map((message, index) => (
          <div key={index} className="mb-4">
            <div className="text-sm text-gray-500">{message.sender}</div>
            <div className="inline-block p-2 bg-gray-50 rounded">
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="h-1/3 pt-4 pb-4 flex">
        {/* 输入消息区 */}
        <div className="flex-grow relative">
          <textarea
            className="w-full h-full p-2 border rounded resize-none"
            placeholder="输入消息..."
          ></textarea>
          <button className="absolute bottom-2 right-4 m-2 p-2 bg-blue-500 text-white rounded">
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
