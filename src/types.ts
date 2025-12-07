import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  User,
} from "discord.js";

export interface PrefixCommand {
  name: string;
  description: string;
  execute: (message: Message, args: string[]) => void | Promise<void>;
}

export interface SlashCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>;
}

export type Command = PrefixCommand | SlashCommand;

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
  user_id: string;
  created_at: number;
}

export interface GuildAnthem {
  guild_id: string;
  created_at: number;
}

export interface PlaylistSong {
  id: string;
  user_id?: string;
  guild_id?: string;
  title: string;
  url: string;
  added_by: string;
  order_index: number;
  seconds: number;
  ts: string;
  added_at: number;
}
