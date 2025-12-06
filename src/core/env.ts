import 'dotenv/config';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? '';
export const CLIENT_ID = process.env.CLIENT_ID ?? '';
export const GUILD_ID = process.env.GUILD_ID ?? '';

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  throw new Error('Missing environment variables. Please check your .env file.');
}
