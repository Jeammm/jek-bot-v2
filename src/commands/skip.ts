import { SlashCommand } from "../types";
import { sessionManager } from "../audio/session_manager";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the currently playing song."),
  execute: async (interaction) => {
    const { guildId } = interaction;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.player.stop();
      await interaction.reply("Skipped the song.");
    } else {
      await interaction.reply("I am not playing anything.");
    }
  },
};

export default command;
