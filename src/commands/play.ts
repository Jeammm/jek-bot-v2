import { AudioPlayerStatus, joinVoiceChannel } from "@discordjs/voice";
import {
  ChannelType,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { searchYouTube } from "../audio/search";
import { sessionManager } from "../audio/session_manager";
import { SlashCommand, Song, Track } from "../types";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from YouTube.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The song you want to play")
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const member = interaction.member as GuildMember;
    const { guildId } = interaction;

    if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
      return;
    }
    const textChannel = interaction.channel;

    if (!member || !guildId) return;

    if (!member.voice.channel) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        ephemeral: true,
      });
      return;
    }

    let session = sessionManager.get(guildId);

    if (!session) {
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guildId,
        adapterCreator: member.guild.voiceAdapterCreator,
      });
      session = sessionManager.create(guildId, connection, textChannel);
    }

    const query = interaction.options.getString("query", true);

    await interaction.reply(`🔎 Searching for "${query}"...`);

    const results = await searchYouTube(query);
    const song: Song | undefined = results.length > 0 ? results[0] : undefined;

    if (!song) {
      await interaction.editReply("❌ Could not find a song to play.");
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
      return;
    }

    const track: Track = {
      ...song,
      requestedBy: interaction.user,
    };

    const playerIsIdle = session.player.getStatus() === AudioPlayerStatus.Idle;
    session.queue.add(track);

    if (playerIsIdle) {
      await interaction.deleteReply().catch(() => {});
      session.playNext();
    } else {
      await interaction.editReply(`✅ Added to queue: **${track.title}**`);
      if (session.nowPlayingMessage) {
        session.updateNowPlayingMessage();
      }
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);
    }
  },
};

export default command;
