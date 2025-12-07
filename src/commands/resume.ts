import { SlashCommand } from "../types";
import { sessionManager } from "../audio/session_manager";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resumes the currently paused song."),
  execute: async (interaction) => {
    const { guildId } = interaction;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.player.resume();
      await interaction.reply("Resumed the music.");
    } else {
      await interaction.reply("I am not playing anything.");
    }
  },
};

export default command;
