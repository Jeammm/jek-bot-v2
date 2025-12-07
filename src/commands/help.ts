import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { SlashCommand } from "../types";
import { commands } from "../handlers/slash_command_handler";

const helpCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays all available commands."),
  execute: async (interaction) => {
    const embed = new EmbedBuilder()
      .setColor(0x4c8fea)
      .setTitle("📘 Bot Command List")
      .setDescription("Here are all the available slash commands:")
      .setThumbnail(interaction.client.user?.displayAvatarURL() || null);

    commands.forEach((command) => {
      embed.addFields({
        name: `🔹 \`/${command.data.name}\``,
        value: command.data.description || "_No description provided._",
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};

export default helpCommand;
