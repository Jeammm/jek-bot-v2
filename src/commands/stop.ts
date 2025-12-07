import { SlashCommand } from "../types";
import { sessionManager } from "../audio/session_manager";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the music and clears the queue."),
  execute: async (interaction) => {
    const { guildId } = interaction;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.destroy();
      await interaction.reply("Stopped the music and cleared the queue.");
    } else {
      await interaction.reply("I am not playing anything.");
    }
  },
};

export default command;
