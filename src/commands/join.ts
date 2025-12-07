import { SlashCommand } from "../types";
import { joinVoiceChannel } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins the voice channel of the user."),
  execute: async (interaction) => {
    const member = interaction.member as GuildMember;
    if (member && member.voice.channel) {
      joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: member.guild.id,
        adapterCreator: member.guild.voiceAdapterCreator,
      });
      await interaction.reply(`Joined ${member.voice.channel.name}!`);
    } else {
      await interaction.reply(
        "You need to be in a voice channel to use this command."
      );
    }
  },
};

export default command;
