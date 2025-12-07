import { SlashCommand } from "../types";
import { sessionManager } from "../audio/session_manager";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses the currently playing song."),
  execute: async (interaction) => {
    const { guildId } = interaction;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.player.pause();
      await interaction.reply("Paused the music.");
    } else {
      await interaction.reply("I am not playing anything.");
    }
  },
};

export default command;
