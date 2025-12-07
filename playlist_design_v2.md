# Discord Music Bot Playlist System Design (Simplified Model)

## Overview
This document describes a simplified but powerful playlist architecture for a Discord music bot supporting:

- **One personal playlist per user**
- **One anthem per guild (server‑wide playlist)**
- Buttons on the **Now Playing message** to:
  - **Add to My Playlist**
  - **Add to Guild Anthem**
- Supabase sql
- Clean and easy-to-maintain schema

This design reduces complexity while keeping the user experience impactful and intuitive.

---

# 1. Core Concepts

## 🎧 User Playlist (exactly 1 per user)
Each user has **one personal playlist**, automatically created when they save their first song.

Properties:
- Belongs to one Discord user
- Follows the user across all servers
- Behaves like a “library” or personal saved songs list
- Unlimited songs

Equivalent to:  
**“My Playlist”**

---

## 🎶 Guild Anthem (exactly 1 per guild)
Each guild has **one shared community playlist**, called the **Anthem**.

Properties:
- Belongs to a guild
- Anyone with permissions can add/remove songs
- Acts as the server’s collective music identity
- Unlimited songs

Equivalent to:  
**“The Server’s Anthem”**

---

# 2. Button-Based Interaction

When the bot sends a **Now Playing** embed, it shows two interactive buttons:

### ▶️ Now Playing Message Buttons  
**1. “Add to My Playlist”**  
- Adds the currently playing song into the user’s personal playlist  
- Auto‑creates playlist if user has none  

**2. “Add to Guild Anthem”**  
- Adds the currently playing song into the guild’s anthem  
- Auto‑creates anthem if server has none  

These interactions bypass slash commands entirely, making playlist usage effortless.

---

# 3. Database Schema (Supabase)

Simplified schema with only two playlist containers.

---

## **user_playlists** table  
Stores one playlist per user.

| Column       | Type      | Notes |
|--------------|-----------|-------|
| user_id      | TEXT (PK) | Discord User ID |
| created_at   | INTEGER   | Timestamp |

---

## **guild_anthems** table  
Stores one anthem per server.

| Column       | Type      | Notes |
|--------------|-----------|-------|
| guild_id     | TEXT (PK) | Discord Guild ID |
| created_at   | INTEGER   | Timestamp |

---

## **playlist_songs** table  
Stores all songs for both playlist types via composite keys.

| Column       | Type      | Notes |
|--------------|-----------|-------|
| id           | TEXT (PK) | UUID |
| user_id      | TEXT      | FK to user_playlists (nullable) |
| guild_id     | TEXT      | FK to guild_anthems (nullable) |
| title        | TEXT      | Song title |
| url          | TEXT      | Song URL |
| added_by     | TEXT      | User who added the song |
| order_index  | INTEGER   | For custom ordering |
| added_at     | INTEGER   | Timestamp |

**Rules:**
- If `user_id` is set → belongs to personal playlist  
- If `guild_id` is set → belongs to anthem  
- Exactly one of the two must be defined

**Stack:**
- use Supabase

---

# 4. Playlist Behavior

## My Playlist (Per User)
- Created automatically when user first presses “Add to My Playlist”
- Can be listed or played with simple commands:
  ```
  {prefix} playlist show
  {prefix} playlist play
  {prefix} playlist remove {number}
  {prefix} playlist add {song}
  ```

## Guild Anthem (Per Server)
- Created automatically when someone presses “Add to Guild Anthem”
- Represents the shared musical identity of the server:
  ```
  {prefix} anthem show
  {prefix} anthem play
  {prefix} anthem remove {number}
  {prefix} anthem add {song}
  ```

---

# 5. Commands Design

## User Playlist Commands (`playlist`)
```
{prefix} playlist show              → shows all songs
{prefix} playlist play              → play the user's playlist
{prefix} playlist remove {number}   → remove specific song
{prefix} playlist add {song}        → add song to user's playlist
```

Adding songs is normally done through the **Now Playing** button.

---

## Anthem Commands (`anthem`)
```
{prefix} anthem show              → display anthem songs
{prefix} anthem play              → play the guild’s anthem
{prefix} anthem remove {number}   → remove specific song
{prefix} anthem add {song}        → add song to guild's anthem
```

Adding songs
1. via the **Add to Guild Anthem** button.
2. via **playlist add {song}** or **anthem add {song}** command. if {song} is an url, fetch the video data and store it. if the {song} is a normal string, search with yt-search and add the first result

---

# 6. Button Interaction Handling

## Button IDs
- `playlist_add_current`
- `anthem_add_current`

## Event Flow (pseudo)
```ts
if (button.id === "playlist_add_current") {
    ensureUserPlaylist(userId);
    saveSongToUserPlaylist(userId, currentSong);
}

if (button.id === "anthem_add_current") {
    ensureGuildAnthem(guildId);
    saveSongToGuildAnthem(guildId, currentSong);
}
```

---

# 7. Now Playing Message Mockup

**Now Playing:**
```
🎵 Song Title — Artist
Requested by: @User
```

Buttons:

```
[ ⭐ Add to My Playlist ]   [ 🔥 Add to Guild Anthem ]
```

Impactful, simple, and frictionless.

---

# 7. Interaction Response

After the command is receive, bot must delete user's command, response with loading and success message then delete them after 5 sec
