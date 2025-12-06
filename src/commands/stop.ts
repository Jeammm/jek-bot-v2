import { Command } from "../types";
import { sessionManager } from "../audio/session_manager";

const command: Command = {
  name: "stop",
  description: "Stops the music and clears the queue.",
  execute: async (message) => {
    const guildId = message.guildId;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.destroy();
      message.reply("Stopped the music and cleared the queue.");
    } else {
      message.reply("I am not playing anything.");
    }
  },
};

export default command;
