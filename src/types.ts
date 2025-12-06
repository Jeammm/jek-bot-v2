import { Message, User } from "discord.js";

export interface Command {
  name: string;
  description: string;
  execute: (message: Message, args: string[]) => void | Promise<void>;
}

export interface Song {
  title: string;
  url: string;
  thumbnail?: string;
  duration: {
    seconds: string | number;
    timestamp: string;
  };
}

export interface Track extends Song {
  requestedBy: User;
}
