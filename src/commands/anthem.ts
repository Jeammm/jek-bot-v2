import {
  getGuildAnthemSongs,
  ensureGuildAnthem,
  saveSongToGuildAnthem,
  removeSongFromGuildAnthem,
} from "../core/db/db";
import { createPlaylistLikeCommand } from "./playlist_core";

export default createPlaylistLikeCommand({
  name: "anthem",
  type: "guild",
  getSongs: getGuildAnthemSongs,
  ensure: ensureGuildAnthem,
  saveSong: saveSongToGuildAnthem,
  removeSong: removeSongFromGuildAnthem,
});
