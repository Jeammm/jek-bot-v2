import { SlashCommand } from "../types";
import { getVoiceConnection } from "@discordjs/voice";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leaves the current voice channel."),
  execute: async (interaction) => {
    if (interaction.guildId) {
      const connection = getVoiceConnection(interaction.guildId);
      if (connection) {
        connection.destroy();
        await interaction.reply("Left the voice channel.");
      } else {
        await interaction.reply("I am not in a voice channel.");
      }
    }
  },
};

export default command;
