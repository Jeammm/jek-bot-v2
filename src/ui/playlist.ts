import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createPlaylistButtons(id: string, type: "user" | "guild") {
  const addToQueue = new ButtonBuilder()
    .setCustomId(`run_playlist_${type}_add_queue_${id}`)
    .setLabel("▶ Add to Queue")
    .setStyle(ButtonStyle.Success);

  const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    addToQueue
  );

  return [controlRow];
}
