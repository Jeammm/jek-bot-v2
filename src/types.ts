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

export interface UserPlaylist {
  userId: string;
  createdAt: number;
}

export interface GuildAnthem {
  guildId: string;
  createdAt: number;
}

export interface PlaylistSong {
  id: string; // UUID
  userId?: string;
  guildId?: string;
  title: string;
  url: string;
  addedBy: string; // User ID of who added it
  orderIndex: number;
  addedAt: number;
}