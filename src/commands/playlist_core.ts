import { Command, PlaylistSong, Song, Track } from "../types";
import { Message, EmbedBuilder, ChannelType } from "discord.js";
import { searchYouTube } from "../audio/search";
import { sessionManager } from "../audio/session_manager";
import { AudioPlayerStatus, joinVoiceChannel } from "@discordjs/voice";
import { createPlaylistButtons } from "../ui/playlist";

interface PlaylistCoreOptions {
  name: string;
  type: "user" | "guild";

  getSongs: (id: string) => Promise<PlaylistSong[]>;
  ensure: (id: string) => Promise<void>;
  saveSong: (id: string, song: Song, addedBy: string) => Promise<void>;
  removeSong: (id: string, order: number) => Promise<PlaylistSong | null>;
}

export function createPlaylistLikeCommand(opts: PlaylistCoreOptions): Command {
  const prefix = opts.name; // playlist or anthem

  return {
    name: opts.name,
    description: `Manage your ${prefix}`,

    async execute(message: Message, args: string[]) {
      const { channel } = message;
      if (channel.type !== ChannelType.GuildText) {
        await message.reply("This command can only be used inside a server.");
        return;
      }

      const ownerId =
        opts.type === "guild" ? message.guild!.id : message.author.id;

      const sub = args[0];

      await opts.ensure(ownerId);

      switch (sub) {
        case "show":
          const songs = await opts.getSongs(ownerId);

          if (!songs.length) {
            await message.reply(`Your ${prefix} is empty.`);
            return;
          }

          const userIds = [...new Set(songs.map((s) => s.added_by))];

          // Step 2: fetch all users
          const users = new Map();
          for (const id of userIds) {
            try {
              const user = await message.client.users.fetch(id);
              users.set(id, user.username);
            } catch {
              users.set(id, "Unknown User");
            }
          }

          const embed = new EmbedBuilder()
            .setTitle(`${prefix.toUpperCase()}`)
            .setDescription(
              songs
                .map(
                  (s, i) =>
                    `**${i + 1}.** [${s.title}](${
                      s.url
                    }) — added by **${users.get(s.added_by)}**`
                )
                .join("\n")
            );

          await message.reply({
            embeds: [embed],
            components: createPlaylistButtons(ownerId, opts.type),
          });

          break;

        case "add":
          const query = args.slice(1).join(" ");
          if (!query) {
            await message.reply(`Usage: ${prefix} add <song name>`);
            return;
          }

          const searching = await message.reply(
            `🔎 Searching for **${query}**...`
          );
          const track = await searchYouTube(query);

          if (!track) {
            await searching.edit("❌ No song found.");
            return;
          }

          await opts.saveSong(ownerId, track[0], message.author.id);

          await searching.edit(`✔ Added **${track[0].title}** to ${prefix}!`);
          break;

        case "remove":
          const index = Number(args[1]) - 1;
          if (isNaN(index)) {
            await message.reply(`Usage: ${prefix} remove <number>`);
            return;
          }
          const removed = await opts.removeSong(ownerId, index);

          if (!removed) {
            await message.reply("❌ Could not find that song.");
            return;
          }

          await message.reply(`🗑 Removed **${removed.title}**`);
          break;

        case "play":
          const voice = message.member?.voice.channel;
          if (!voice) {
            await message.reply("You must join a voice channel.");
            return;
          }

          let session = sessionManager.get(message.guild!.id);

          if (!session) {
            const connection = joinVoiceChannel({
              channelId: voice.id,
              guildId: message.guild!.id,
              adapterCreator: message.guild!.voiceAdapterCreator,
            });

            session = sessionManager.create(
              message.guild!.id,
              connection,
              channel
            );
          }

          const list = await opts.getSongs(ownerId);
          if (!list.length) {
            await message.reply("Playlist is empty.");
            return;
          }

          for (const song of list) {
            const track: Track = {
              title: song.title,
              url: song.url,
              duration: { seconds: song.seconds, timestamp: song.ts },
              requestedBy: message.author,
            };
            session.queue.add(track);
          }

          const playerIsIdle =
            session.player.getStatus() === AudioPlayerStatus.Idle;

          if (playerIsIdle) {
            session.playNext();
          }

          if (session.nowPlayingMessage) {
            session.updateNowPlayingMessage();
          }

          break;

        default:
          await message.reply(`Unknown command. Try: show, add, remove, play`);
      }
    },
  };
}
