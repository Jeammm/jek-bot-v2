import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createControlButtons(options: { isPaused: boolean }) {
  const skip = new ButtonBuilder()
    .setCustomId('skip')
    .setLabel('⏭ Skip')
    .setStyle(ButtonStyle.Secondary);

  const stop = new ButtonBuilder()
    .setCustomId('stop')
    .setLabel('⏹ Stop')
    .setStyle(ButtonStyle.Danger);

  const pauseResumeButton = options.isPaused
    ? new ButtonBuilder()
        .setCustomId('resume')
        .setLabel('▶ Resume')
        .setStyle(ButtonStyle.Success)
    : new ButtonBuilder()
        .setCustomId('pause')
        .setLabel('⏸ Pause')
        .setStyle(ButtonStyle.Secondary);

  const addToMyPlaylist = new ButtonBuilder()
    .setCustomId('playlist_add_current')
    .setLabel('⭐ Add to My Playlist')
    .setStyle(ButtonStyle.Primary);

  const addToGuildAnthem = new ButtonBuilder()
    .setCustomId('anthem_add_current')
    .setLabel('🔥 Add to Guild Anthem')
    .setStyle(ButtonStyle.Primary);

  const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    pauseResumeButton,
    skip,
    stop,
  );

  const playlistRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    addToMyPlaylist,
    addToGuildAnthem,
  );

  return [controlRow, playlistRow];
}
