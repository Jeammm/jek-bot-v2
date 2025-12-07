import {
  getUserPlaylistSongs,
  ensureUserPlaylist,
  saveSongToUserPlaylist,
  removeSongFromUserPlaylist,
} from "../core/db/db";
import { createPlaylistLikeCommand } from "./playlist_core";

export default createPlaylistLikeCommand({
  name: "playlist",
  type: "user",
  getSongs: getUserPlaylistSongs,
  ensure: ensureUserPlaylist,
  saveSong: saveSongToUserPlaylist,
  removeSong: removeSongFromUserPlaylist,
});
