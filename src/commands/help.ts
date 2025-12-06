import { Message, EmbedBuilder } from "discord.js";
import { Command } from "../types";
import { getCommands } from "../handlers/command_handler";
import { PREFIX } from "../core/env";

const helpCommand: Command = {
  name: "help",
  description: "Displays all available commands.",
  execute: async (message: Message) => {
    const commands = getCommands();

    const embed = new EmbedBuilder()
      .setColor(0x4c8fea)
      .setTitle("📘 Bot Command List")
      .setDescription(
        `Use \`${PREFIX}<command>\` to run a command.\n\n**Available Commands:**`
      )
      .setThumbnail(message.client.user?.displayAvatarURL() || null);

    commands.forEach((command) => {
      embed.addFields({
        name: `🔹 \`${PREFIX} ${command.name}\``,
        value: command.description || "_No description provided._",
      });
    });

    await message.reply({ embeds: [embed] });
  },
};

export default helpCommand;
