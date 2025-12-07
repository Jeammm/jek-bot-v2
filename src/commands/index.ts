import { registerCommand } from "../handlers/command_handler";
import { Command } from "../types";
import { logger } from "../core/logger";

import join from "./join";
import leave from "./leave";
import pause from "./pause";
import play from "./play";
import resume from "./resume";
import skip from "./skip";
import stop from "./stop";
import help from "./help";
import playlist from "./playlist";
import anthem from "./anthem";

const commands: Command[] = [
  join,
  leave,
  pause,
  play,
  resume,
  skip,
  stop,
  help,
  playlist,
  anthem,
];

export function loadCommands() {
  for (const command of commands) {
    if (command && typeof command === "object" && "name" in command) {
      registerCommand(command as Command);
    } else {
      logger.error(
        `Error loading a command: it is not a valid command object.`
      );
    }
  }
}
