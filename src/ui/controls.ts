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

  const components = [
    options.isPaused
      ? new ButtonBuilder()
          .setCustomId('resume')
          .setLabel('▶ Resume')
          .setStyle(ButtonStyle.Success)
      : new ButtonBuilder()
          .setCustomId('pause')
          .setLabel('⏸ Pause')
          .setStyle(ButtonStyle.Secondary),
    skip,
    stop,
  ];

  return new ActionRowBuilder<ButtonBuilder>().addComponents(components);
}
