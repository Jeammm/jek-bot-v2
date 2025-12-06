import { Command } from "../types";
import { sessionManager } from "../audio/session_manager";

const command: Command = {
  name: "skip",
  description: "Skips the currently playing song.",
  execute: async (message) => {
    const guildId = message.guildId;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.player.stop();
      message.reply("Skipped the song.");
    } else {
      message.reply("I am not playing anything.");
    }
  },
};

export default command;
