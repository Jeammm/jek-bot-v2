import client from "./core/discord_client";
import { logger } from "./core/logger";
import { DISCORD_TOKEN } from "./core/env";
import "./handlers/interaction_handler";
import { initializeDatabase } from "./core/db/db";
import { deployCommands } from "./core/deploy_commands";

logger.info("Starting bot...");

client.on("ready", async () => {
  if (!client.user) {
    return;
  }
  logger.info(`${client.user.tag} is ready!`);

  const guilds = client.guilds.cache.map((guild) => guild);
  for (const guild of guilds) {
    await deployCommands(guild.id);
  }
});

initializeDatabase()
  .then(() => {
    client.login(DISCORD_TOKEN).catch((error) => {
      logger.error("Failed to log in:", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize database:", error);
    process.exit(1);
  });
