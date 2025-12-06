import { AudioPlayerStatus, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, GuildMember } from "discord.js";
import { searchYouTube } from "../audio/search";
import { sessionManager } from "../audio/session_manager";
import { Command, Song, Track } from "../types";

const command: Command = {
  name: "play",
  description: "Plays a song from YouTube.",
  execute: async (message, args) => {
    message.delete().catch(() => {}); // Delete user's command message

    const member = message.member as GuildMember;
    const guildId = message.guildId;

    if (!message.channel || message.channel.type !== ChannelType.GuildText) {
      return;
    }
    const textChannel = message.channel;

    if (!member || !guildId) return;

    if (!member.voice.channel) {
      const msg = await textChannel.send(
        "You need to be in a voice channel to use this command."
      );
      setTimeout(() => msg.delete().catch(() => {}), 5000);
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

    const query = args.join(" ");
    if (!query) {
      const msg = await textChannel.send("Please provide a song name or URL.");
      setTimeout(() => msg.delete().catch(() => {}), 5000);
      return;
    }

    const feedbackMessage = await textChannel.send(
      `🔎 Searching for "${query}"...`
    );

    const results = await searchYouTube(query);
    const song: Song | undefined = results.length > 0 ? results[0] : undefined;

    if (!song) {
      await feedbackMessage.edit("❌ Could not find a song to play.");
      setTimeout(() => feedbackMessage.delete().catch(() => {}), 5000);
      return;
    }

    const track: Track = {
      ...song,
      requestedBy: message.author,
    };

    const playerIsIdle = session.player.getStatus() === AudioPlayerStatus.Idle;
    session.queue.add(track);

    if (playerIsIdle) {
      await feedbackMessage.delete().catch(() => {});
      session.playNext();
    } else {
      await feedbackMessage.edit(`✅ Added to queue: **${track.title}**`);
      if (session.nowPlayingMessage) {
        session.updateNowPlayingMessage();
      }
      setTimeout(() => {
        feedbackMessage.delete().catch(() => {}); // Ignore errors
      }, 5000);
    }
  },
};

export default command;
