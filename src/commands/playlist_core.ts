import { SlashCommand, PlaylistSong, Song, Track } from "../types";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  TextChannel,
  ChatInputCommandInteraction,
} from "discord.js";
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

export function createPlaylistLikeCommand(
  opts: PlaylistCoreOptions
): SlashCommand {
  const data = new SlashCommandBuilder()
    .setName(opts.name)
    .setDescription(`Manage your ${opts.name}`)
    .addSubcommand((subcommand) =>
      subcommand.setName("show").setDescription(`Show your ${opts.name}`)
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription(`Add a song to your ${opts.name}`)
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The song to add")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription(`Remove a song from your ${opts.name}`)
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription("The number of the song to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("play").setDescription(`Play your ${opts.name}`)
    );

  return {
    data,
    async execute(interaction: ChatInputCommandInteraction) {
      const { channel } = interaction;
      if (!(channel instanceof TextChannel)) {
        await interaction.reply(
          "This command can only be used inside a server."
        );
        return;
      }

      const ownerId =
        opts.type === "guild" ? interaction.guild!.id : interaction.user.id;

      const sub = interaction.options.getSubcommand();

      await opts.ensure(ownerId);

      switch (sub) {
        case "show":
          const songs = await opts.getSongs(ownerId);

          if (!songs.length) {
            await interaction.reply(`${opts.name} is empty.`);
            return;
          }

          const userIds = [...new Set(songs.map((s) => s.added_by))];

          // Step 2: fetch all users
          const users = new Map();
          for (const id of userIds) {
            try {
              const user = await interaction.client.users.fetch(id);
              users.set(id, user.username);
            } catch {
              users.set(id, "Unknown User");
            }
          }

          const embed = new EmbedBuilder()
            .setTitle(opts.name.toUpperCase())
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

          await interaction.reply({
            embeds: [embed],
            components: createPlaylistButtons(ownerId, opts.type),
          });

          break;

        case "add":
          const query = interaction.options.getString("query", true);

          const searching = await interaction.reply(
            `🔎 Searching for **${query}**...`
          );
          const track = await searchYouTube(query);

          if (!track) {
            await searching.edit("❌ No song found.");
            return;
          }

          await opts.saveSong(ownerId, track[0], interaction.user.id);

          await searching.edit(
            `✔ Added **${track[0].title}** to ${opts.name}!`
          );
          break;

        case "remove":
          const index = interaction.options.getInteger("number", true) - 1;
          const removed = await opts.removeSong(ownerId, index);

          if (!removed) {
            await interaction.reply("❌ Could not find that song.");
            return;
          }

          await interaction.reply(`🗑 Removed **${removed.title}**`);
          break;

        case "play":
          const member = interaction.member;
          if (!member || !("voice" in member)) {
            return;
          }
          const voice = member.voice.channel;
          if (!voice) {
            await interaction.reply("You must join a voice channel.");
            return;
          }

          let session = sessionManager.get(interaction.guild!.id);

          if (!session) {
            const connection = joinVoiceChannel({
              channelId: voice.id,
              guildId: interaction.guild!.id,
              adapterCreator: interaction.guild!.voiceAdapterCreator,
            });

            session = sessionManager.create(
              interaction.guild!.id,
              connection,
              channel
            );
          }

          const list = await opts.getSongs(ownerId);
          if (!list.length) {
            await interaction.reply("Playlist is empty.");
            return;
          }

          for (const song of list) {
            const track: Track = {
              title: song.title,
              url: song.url,
              duration: {
                seconds: song.seconds,
                timestamp: song.ts,
              },
              requestedBy: interaction.user,
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
          await interaction.reply(
            `Unknown command. Try: show, add, remove, play`
          );
      }
    },
  };
}
