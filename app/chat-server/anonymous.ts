import { stringify } from "yaml";
import OpenAI from "openai";
import { Server, Socket } from "socket.io";
import { Message, AI_SENDER, SYSTEM_SENDER } from "./definition";
import {
  SERVER_MESSAGE_ONE,
  SERVER_MESSAGE_ONE_PART,
  SERVER_MESSAGE_ALL,
} from "./constant";
import {
  AnonymousStageEnum,
  AnonymousState,
  AnonymousCommandEnum,
} from "./anonymous-def";

const openai = new OpenAI();
const llmModel = "openai/gpt-4-turbo";

export class AnonymousController {
  public state: AnonymousState;

  constructor(state: AnonymousState) {
    this.state = state;
  }

  public async login(
    io: Server,
    socket: Socket,
    roomId: string,
    userName: string
  ) {
    // 恢复聊天记录
    socket.emit(SERVER_MESSAGE_ALL, roomId, this.state.messageHistory);

    // 欢迎消息
    let loginMessage: Message;
    if (this.state.stage === AnonymousStageEnum.START) {
      loginMessage = {
        content: `欢迎来到${this.state.description}，当前活动未开始，请发送 ${AnonymousCommandEnum.SIGN_UP} 报名`,
        sender: SYSTEM_SENDER,
      };
    } else if (
      this.state.stage === AnonymousStageEnum.CHAT_INTRO ||
      this.state.stage === AnonymousStageEnum.CHAT_STORY
    ) {
      loginMessage = {
        content: `欢迎来到${this.state.description}，当前活动进行中，请安静围观`,
        sender: SYSTEM_SENDER,
      };
    } else if (this.state.stage === AnonymousStageEnum.END) {
      loginMessage = {
        content: `欢迎来到${this.state.description}，当前活动已结束，请下次再来`,
        sender: SYSTEM_SENDER,
      };
    } else {
      loginMessage = {
        content: "未知聊天室状态，请联系管理员",
        sender: SYSTEM_SENDER,
      };
    }

    // 等1s再发，避免太频繁了，
    // bug可能导致恢复聊天记录的消息冲突
    setTimeout(() => {
      socket.emit(SERVER_MESSAGE_ONE, roomId, loginMessage);
    }, 1000);
  }

  public async logout(
    io: Server,
    socket: Socket,
    roomId: string,
    userName: string
  ) {
    // do nothing
  }

  public async oneMessage(
    io: Server,
    socket: Socket,
    roomId: string,
    message: Message,
    allow_users: Set<string>
  ) {
    // 开始阶段
    if (this.state.stage === AnonymousStageEnum.START) {
      const messageContent = message.content;
      const userName = message.sender;
      // 报名
      if (messageContent.includes(AnonymousCommandEnum.SIGN_UP)) {
        if (this.state.allUsers.includes(userName)) {
          const signedUpMessage: Message = {
            content: `${userName} 已报名，请勿重复报名`,
            sender: SYSTEM_SENDER,
          };
          socket.emit(SERVER_MESSAGE_ONE, roomId, signedUpMessage);
        } else {
          this.state.allUsers.push(userName);
          const signUpMessage: Message = {
            content: `${userName} 报名成功，当前已报名用户：${this.state.allUsers.join(
              ", "
            )}`,
            sender: SYSTEM_SENDER,
          };
          io.to(roomId).emit(SERVER_MESSAGE_ONE, roomId, signUpMessage);
        }

        const startMessage: Message = {
          content: `已报名用户可以发送 ${AnonymousCommandEnum.START} 开始活动`,
          sender: SYSTEM_SENDER,
        };
        io.to(roomId).emit(SERVER_MESSAGE_ONE, roomId, startMessage);
      }

      // 开始
      else if (messageContent.includes(AnonymousCommandEnum.START)) {
        if (this.state.allUsers.includes(userName)) {
          // 切换到聊天阶段
          this.state.stage = AnonymousStageEnum.CHAT_INTRO;
          const startMessage: Message = {
            content: `活动开始，欢迎 ${this.state.allUsers.join(", ")} 参与`,
            sender: SYSTEM_SENDER,
          };
          io.to(roomId).emit(SERVER_MESSAGE_ONE, roomId, startMessage);

          // 设置只有已报名用户可以发言
          allow_users.clear();
          this.state.allUsers.forEach((user) => {
            allow_users.add(user);
          });

          // 生成开场白
          await this.generateOpening(io, roomId, allow_users);

          // 设置第一位用户可以发言
          const firstUser = this.state.allUsers[0];
          allow_users.clear();
          allow_users.add(firstUser);

          // 请第一位用户发言
          await this.guideUserSelfIntroduction(
            io,
            roomId,
            firstUser,
            allow_users
          );
        } else {
          const notSignedUpMessage: Message = {
            content: `${userName} 未报名，只有已报名用户才能开始活动`,
            sender: SYSTEM_SENDER,
          };
          socket.emit(SERVER_MESSAGE_ONE, roomId, notSignedUpMessage);
        }
      }
    }

    // 聊天-自我介绍阶段
    else if (this.state.stage === AnonymousStageEnum.CHAT_INTRO) {
      console.assert(allow_users.size === 1, "allow_users.length should be 1");
      const currentUser = allow_users.entries().next().value[0];
      console.assert(
        message.sender === currentUser,
        "message.sender should be currentUser"
      );

      // 保存用户发言
      this.state.messageHistory.push(message);

      // 切换到下一个用户
      const nextUserIndex = this.state.allUsers.indexOf(currentUser) + 1;
      const nextUser =
        nextUserIndex < this.state.allUsers.length
          ? this.state.allUsers[nextUserIndex]
          : null;
      if (nextUser) {
        // 设置下一个用户可以发言
        allow_users.clear();
        allow_users.add(nextUser);

        // 请下一个用户发言
        await this.guideUserSelfIntroduction(io, roomId, nextUser, allow_users);
      } else {
        // 所有用户都发言完毕
        // 切换到聊天-故事阶段
        this.state.stage = AnonymousStageEnum.CHAT_STORY;

        // 设置第一位用户可以发言
        const firstUser = this.state.allUsers[0];
        allow_users.clear();
        allow_users.add(firstUser);

        // 请第一位用户发言
        await this.guideUserStoryTelling(io, roomId, firstUser, allow_users);
      }
    }

    // 聊天-故事阶段
    else if (this.state.stage === AnonymousStageEnum.CHAT_STORY) {
      console.assert(allow_users.size === 1, "allow_users.length should be 1");
      const currentUser = allow_users.entries().next().value[0];
      console.assert(
        message.sender === currentUser,
        "message.sender should be currentUser"
      );

      // 保存用户发言
      this.state.messageHistory.push(message);

      // 切换到下一个用户
      const nextUserIndex = this.state.allUsers.indexOf(currentUser) + 1;
      const nextUser =
        nextUserIndex < this.state.allUsers.length
          ? this.state.allUsers[nextUserIndex]
          : null;
      if (nextUser) {
        // 设置下一个用户可以发言
        allow_users.clear();
        allow_users.add(nextUser);

        // 请下一个用户发言
        await this.guideUserStoryTelling(io, roomId, nextUser, allow_users);
      } else {
        // 所有用户都发言完毕
        // 切换到结束阶段
        this.state.stage = AnonymousStageEnum.END;

        // 禁止所有用户发言
        allow_users.clear();

        // 生成结束语
        await this.generateEnding(io, roomId, allow_users);
      }
    }

    // 结束阶段
    else if (this.state.stage === AnonymousStageEnum.END) {
      const endMessage: Message = {
        content: "活动已结束，请下次再来",
        sender: SYSTEM_SENDER,
      };
      socket.emit(SERVER_MESSAGE_ONE, roomId, endMessage);
    }

    // error
    else {
      const errorMessage: Message = {
        content: "未知聊天室状态，请联系管理员",
        sender: SYSTEM_SENDER,
      };
      socket.emit(SERVER_MESSAGE_ONE, roomId, errorMessage);
    }
  }

  // 生成AI回复并且串流发送给客户端
  private async generateAIResponse(
    io: Server,
    roomId: string,
    allow_users: Set<string>,
    prompt: string
  ) {
    console.log(prompt);

    // 保存原来的允许发言用户
    const oldAllowUsers = new Set(allow_users);
    allow_users.clear(); // AI发言时禁止其他用户发言
    try {
      const completion = await openai.chat.completions.create({
        model: llmModel,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      });

      const aiMessage: Message = {
        content: "",
        sender: AI_SENDER,
      };
      // 创建一个新的空的AI消息
      io.to(roomId).emit(SERVER_MESSAGE_ONE, roomId, aiMessage);

      let content = "";
      for await (const chunk of completion) {
        const newPart = chunk.choices[0].delta.content;
        content += newPart;
        // 发送部分AI消息更新
        io.to(roomId).emit(SERVER_MESSAGE_ONE_PART, roomId, newPart);
      }
      aiMessage.content = content;

      // 更新全部消息
      this.state.messageHistory.push(aiMessage);
      io.to(roomId).emit(SERVER_MESSAGE_ALL, roomId, this.state.messageHistory);
    } finally {
      // 恢复原来的允许发言用户
      allow_users.clear();
      oldAllowUsers.forEach((user) => {
        allow_users.add(user);
      });
    }
  }

  // 生成开场白
  private async generateOpening(
    io: Server,
    roomId: string,
    allow_users: Set<string>
  ) {
    const prompt = `你是一个${this.state.description}的主持人，请生成一段开场白`;
    await this.generateAIResponse(io, roomId, allow_users, prompt);
  }

  private generateContextPrompt(): string {
    let contextPrompt = "";
    contextPrompt += `你是一个${this.state.description}的主持人\n`;
    contextPrompt += `以下是${this.state.description}内过去的聊天历史：\n`;

    // 生成聊天历史
    let chatHistory = Array<Message>();
    for (let i = 0; i < this.state.messageHistory.length; i++) {
      const message = this.state.messageHistory[i];
      if (message.sender === AI_SENDER) {
        chatHistory.push({
          sender: "主持人",
          content: message.content,
        });
      } else {
        chatHistory.push({
          sender: message.sender,
          content: message.content,
        });
      }
    }
    const chatHistoryStr = stringify(chatHistory);

    contextPrompt += "```yaml\n";
    contextPrompt += chatHistoryStr;
    contextPrompt += "```\n";
    return contextPrompt;
  }

  // 引导用户发言-自我介绍
  private async guideUserSelfIntroduction(
    io: Server,
    roomId: string,
    userName: string,
    allow_users: Set<string>
  ) {
    const contextPrompt = this.generateContextPrompt();
    const currentUserName = userName;
    const currentUserIndex = this.state.allUsers.indexOf(currentUserName);
    let lastUserName = null;
    if (currentUserIndex > 0) {
      lastUserName = this.state.allUsers[currentUserIndex - 1];
    }

    let prompt = contextPrompt;
    if (lastUserName) {
      prompt += `上一个发言的用户是 ${lastUserName}\n`;
      prompt += `下一个将要发言的用户是 ${currentUserName}\n`;
      prompt += `请你简单回应上一个用户的发言，并且引导下一个用户发言，进行自我介绍\n`;
    } else {
      prompt += `请你引导用户 ${currentUserName} 进行自我介绍\n`;
    }
    prompt += `注意，请区分不同用户的发言内容，且只输出主持人的发言，不要输出用户的发言\n`;
    prompt += `请直接输出主持人的发言内容，不带有任何格式\n`;
    await this.generateAIResponse(io, roomId, allow_users, prompt);
  }

  // 引导用户发言-讲述自己的故事
  private async guideUserStoryTelling(
    io: Server,
    roomId: string,
    userName: string,
    allow_users: Set<string>
  ) {
    const contextPrompt = this.generateContextPrompt();
    const currentUserName = userName;
    const currentUserIndex = this.state.allUsers.indexOf(currentUserName);
    let lastUserName = null;
    if (currentUserIndex > 0) {
      lastUserName = this.state.allUsers[currentUserIndex - 1];
    } else {
      lastUserName = this.state.allUsers[this.state.allUsers.length - 1];
    }

    let prompt = contextPrompt;
    prompt += `上一个发言的用户是 ${lastUserName}\n`;
    prompt += `下一个将要发言的用户是 ${currentUserName}\n`;
    prompt += `请你简单回应上一个用户的发言，并且引导用户 ${currentUserName} 讲述自己的故事\n`;
    prompt += `注意，请区分不同用户的发言内容，且只输出主持人的发言，不要输出用户的发言\n`;
    prompt += `请直接输出主持人的发言内容，不带有任何格式\n`;
    await this.generateAIResponse(io, roomId, allow_users, prompt);
  }

  // 生成结束语
  private async generateEnding(
    io: Server,
    roomId: string,
    allow_users: Set<string>
  ) {
    const contextPrompt = this.generateContextPrompt();
    let prompt = contextPrompt;
    prompt += `请你根据以上的聊天历史，总结今天的${this.state.description}活动，生成一段结束语\n`;
    prompt += `请直接输出主持人的发言内容，不带有任何格式\n`;
    await this.generateAIResponse(io, roomId, allow_users, prompt);
  }
}
