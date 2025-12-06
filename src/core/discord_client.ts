import { Client, GatewayIntentBits } from "discord.js";
import { logger } from "./logger";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("clientReady", () => {
  if (client.user) {
    logger.info(`Logged in as ${client.user.tag}!`);
  }
});

export default client;
