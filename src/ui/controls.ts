import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createControlButtons() {
  const pause = new ButtonBuilder()
    .setCustomId('pause')
    .setLabel('⏸ Pause')
    .setStyle(ButtonStyle.Secondary);

  const resume = new ButtonBuilder()
    .setCustomId('resume')
    .setLabel('▶ Resume')
    .setStyle(ButtonStyle.Secondary);

  const skip = new ButtonBuilder()
    .setCustomId('skip')
    .setLabel('⏭ Skip')
    .setStyle(ButtonStyle.Secondary);

  const stop = new ButtonBuilder()
    .setCustomId('stop')
    .setLabel('⏹ Stop')
    .setStyle(ButtonStyle.Danger);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(pause, resume, skip, stop);
}
