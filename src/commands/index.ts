import { SlashCommand } from "../types";

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

export const slashCommands: SlashCommand[] = [
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
