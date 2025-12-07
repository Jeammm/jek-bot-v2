import { config } from "dotenv";
import path from "path";

const envFile = `.env.${process.env.NODE_ENV || "dev"}`;

config({
  path: path.resolve(process.cwd(), envFile),
});

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? "";
export const CLIENT_ID = process.env.CLIENT_ID ?? "";
export const GUILD_ID = process.env.GUILD_ID ?? "";
export const PREFIX = process.env.PREFIX ?? "";

export const DATABASE_HOST = process.env.DATABASE_HOST ?? "";
export const DATABASE_PORT = Number(process.env.DATABASE_PORT) ?? 0;
export const DATABASE_USER = process.env.DATABASE_USER ?? "";
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? "";
export const DATABASE = process.env.DATABASE ?? "";

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID || !PREFIX) {
  throw new Error("Missing environment variables. Please check your env file.");
}

if (
  !DATABASE_HOST ||
  !DATABASE_PORT ||
  !DATABASE_USER ||
  !DATABASE_PASSWORD ||
  !DATABASE
) {
  throw new Error(
    "Missing database environment variables. Please check your env file."
  );
}
