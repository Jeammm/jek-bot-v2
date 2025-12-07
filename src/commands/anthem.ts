import { Command } from "../types";
import { Message, EmbedBuilder, ChannelType } from "discord.js";
import {
  getGuildAnthemSongs,
  removeSongFromGuildAnthem,
  ensureGuildAnthem,
  saveSongToGuildAnthem,
} from "../core/db/db";
import { logger } from "../core/logger";
import { sessionManager } from "../audio/session_manager";
import { searchYouTube } from "../audio/search";
import { Track } from "../types";
import { joinVoiceChannel } from "@discordjs/voice";

const anthemCommand: Command = {
  name: "anthem",
  description: "Manage the guild's anthem.",
  async execute(message: Message, args: string[]) {
    const subCommand = args[0];
    const { guildId, channel, member } = message;

    if (!channel || channel.type !== ChannelType.GuildText) {
      return;
    }

    if (!guildId) {
      await message.reply("This command can only be used in a server.");
      return;
    }

    switch (subCommand) {
      case "show":
        const songs = await getGuildAnthemSongs(guildId);
        if (songs.length === 0) {
          await message.reply("The guild anthem is empty.");
          return;
        }

        const embed = new EmbedBuilder()
          .setColor("#FFD700")
          .setTitle(`${message.guild?.name}'s Anthem`)
          .setDescription(
            songs
              .map(
                (song, index) => `${index + 1}. [${song.title}](${song.url})`
              )
              .join("\n")
          );

        await message.reply({ embeds: [embed] });
        break;

      case "play":
        const anthemSongs = await getGuildAnthemSongs(guildId);
        if (anthemSongs.length === 0) {
          await message.reply("The guild anthem is empty.");
          return;
        }

        let session = sessionManager.get(guildId);

        if (!member?.voice.channel) {
          const msg = await channel.send(
            "You need to be in a voice channel to use this command."
          );
          setTimeout(() => msg.delete().catch(() => {}), 5000);
          return;
        }

        if (!session) {
          const connection = joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: guildId,
            adapterCreator: member.guild.voiceAdapterCreator,
          });
          session = sessionManager.create(guildId, connection, channel);
        }

        for (const song of anthemSongs) {
          const track: Track = {
            title: song.title,
            url: song.url,
            duration: { seconds: song.seconds, timestamp: song.ts },
            requestedBy: message.author,
          };
          session.queue.add(track);
        }

        if (!session.player.getStatus()) {
          session.playNext();
        }
        await message.reply("Playing the guild anthem now!");
        break;

      case "remove":
        const indexToRemove = parseInt(args[1], 10);
        if (isNaN(indexToRemove) || indexToRemove <= 0) {
          await message.reply(
            "Please provide a valid number for the song to remove."
          );
          return;
        }

        try {
          const removed = await removeSongFromGuildAnthem(
            guildId,
            indexToRemove - 1
          );
          if (removed) {
            await message.reply(
              `Removed **${removed.title}** from the guild anthem.`
            );
          } else {
            await message.reply("Song not found at that index in the anthem.");
          }
        } catch (error) {
          logger.error("Error removing song from guild anthem:", error);
          await message.reply("Failed to remove song from the guild anthem.");
        }
        break;

      case "add":
        const query = args.slice(1).join(" ");
        if (!query) {
          await message.reply("Please provide a song title or URL to add.");
          return;
        }

        await ensureGuildAnthem(guildId);

        const searchingMessage = await channel.send(
          `🔎 Searching for "${query}"...`
        );

        const result = await searchYouTube(query);

        if (!result) {
          await message.reply("Could not find a song with that query.");
          return;
        }

        await saveSongToGuildAnthem(guildId, result[0], message.author.id);
        await searchingMessage.edit(
          `Added **${result[0].title}** to the guild anthem.`
        );

        break;

      default:
        await message.reply(
          "Unknown anthem subcommand. Use `show`, `play`, `add`, or `remove`."
        );
        break;
    }
  },
};

export default anthemCommand;
