# MeepleRoll

A Discord bot that picks random board games from your collection. No repeats, no thinking, just play.

MeepleRoll helps you discover board games from your collection that you haven't played recently. It can suggest games based on player count and automatically posts weekly suggestions to your Discord channel.

## Features

- **Random Game Suggestions**: Get random board game suggestions filtered by player count
- **Weekly Scheduled Posts**: Automatically posts game suggestions every Sunday (configurable)
- **Add Games**: Add new games to your collection via Discord commands
- **Remove Games**: Remove games from your collection via Discord commands
- **Player Count Filtering**: Filter games by number of players
- **Recently Played Filtering**: Excludes games you've played recently (configurable threshold)

## Setup

### Prerequisites

- Node.js 20+ 
- A Discord bot token
- A Discord server where you want to use the bot

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aottr/MeepleRoll.git
cd MeepleRoll
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables (see [Environment Variables](#environment-variables))

4. Configure your bot (see [Configuration File](#configuration-file))

5. Start the bot:
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

## Environment Variables

Environment variables are loaded from a `.env` file in the project root. Create this file by copying `example.env`:

```bash
cp example.env .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Your Discord bot token. **Required** - This is the only setting that MUST be in `.env` for security reasons. | `your_bot_token_here` |

### Optional Variables

All other settings can be configured in `config.yml`, but environment variables will override config file values if set:

| Variable | Description | Overrides Config |
|----------|-------------|------------------|
| `APPLICATION_ID` | Your bot's Application ID | `applicationId` |
| `CHANNEL_ID` | Discord channel ID where scheduled posts are sent | `channelId` |
| `CRON_SCHEDULE` | Cron schedule for weekly posts | `cronSchedule` |
| `TZ` | Timezone for scheduled posts | `timezone` |
| `DEFAULT_GAME_COUNT` | Default number of games to suggest | `defaultGameCount` |
| `DEFAULT_PLAYER_COUNT` | Default number of players for filtering | `defaultPlayerCount` |
| `DAYS_THRESHOLD` | Days threshold for "recently played" games | `daysThreshold` |
| `MAX_GAME_COUNT` | Maximum number of games that can be requested | `maxGameCount` |
| `MAX_PLAYER_COUNT` | Maximum number of players for filtering | `maxPlayerCount` |

## Configuration File

The bot uses a `config.yml` file for all settings (except the Discord token). Create this file by copying `config.yml.example`:

```bash
cp config.yml.example config.yml
```

### Configuration Options

#### Discord Bot Configuration

```yaml
# Your bot's Application ID (should be quoted to avoid precision loss)
applicationId: "your_client_id_here"

# Discord channel ID where scheduled posts are sent
channelId: "your_channel_id_here"
```

**How to find these IDs:**
- **Application ID**: Discord Developer Portal → Your Application → General Information
- **Channel ID**: Enable Developer Mode in Discord → Right-click channel → Copy ID

#### Scheduled Posts Configuration

```yaml
# Cron schedule format: minute hour day month day-of-week
# Example: "0 9 * * 0" = Sunday at 9:00 AM
cronSchedule: "0 9 * * 0"

# Timezone for scheduled posts (IANA timezone format)
timezone: "Europe/Paris"
```

**Cron Schedule Examples:**
- `"0 9 * * 0"` - Every Sunday at 9:00 AM
- `"0 12 * * 1"` - Every Monday at 12:00 PM
- `"0 18 * * 5"` - Every Friday at 6:00 PM

#### Game Selection Defaults

```yaml
# Number of games to suggest by default
defaultGameCount: 3

# Default number of players for filtering
defaultPlayerCount: 2

# Days threshold for "recently played" games
# Games played within this many days will be excluded
daysThreshold: 30

# Maximum values for slash command options
maxGameCount: 10
maxPlayerCount: 20
```

### Configuration Priority

Settings are loaded in this order (later values override earlier ones):
1. Default values
2. `config.yml` file
3. Environment variables (highest priority)

## Commands

### `/roll`

Get random board game suggestions from your collection.

**Options:**
- `count` (optional, integer): Number of games to suggest. Default: `defaultGameCount` from config (usually 3). Range: 1 to `maxGameCount`
- `players` (optional, integer): Number of players to filter by. Default: `defaultPlayerCount` from config (usually 2). Range: 1 to `maxPlayerCount`

**Examples:**
- `/roll` - Get 3 games for 2 players (defaults)
- `/roll count:5 players:4` - Get 5 games for 4 players
- `/roll players:1` - Get 3 games for 1 player

**How it works:**
1. Filters out games you've played within the last `daysThreshold` days (default: 30 days)
2. Filters games by player count (checks if player count is within `minPlayers` and `maxPlayers`)
3. Randomly selects the requested number of games
4. If no unplayed games match, it falls back to all games matching the player count

### `/addgame`

Add a new board game to your collection.

**Options:**
- `name` (required, string): Name of the game
- `minplayers` (required, integer): Minimum number of players (minimum: 1)
- `maxplayers` (required, integer): Maximum number of players (minimum: 1)

**Examples:**
- `/addgame name:Terraforming Mars minplayers:1 maxplayers:5`
- `/addgame name:Wingspan minplayers:1 maxplayers:5`

**Notes:**
- Games are added with `lastPlayed` set to `null` (never played)
- If a game with the same name (case-insensitive) already exists, you'll get an error

### `/removegame`

Remove a board game from your collection.

**Options:**
- `name` (required, string): Name of the game to remove (with autocomplete)

**Examples:**
- `/removegame name:Terraforming Mars`

**Features:**
- Autocomplete helps you find games by typing part of the name
- Case-insensitive matching

## Game Data

Games are stored in `data/games.json`. The file structure is:

```json
[
  {
    "name": "Terraforming Mars",
    "lastPlayed": "2025-12-01",
    "minPlayers": 1,
    "maxPlayers": 5
  },
  {
    "name": "Wingspan",
    "lastPlayed": null,
    "minPlayers": 1,
    "maxPlayers": 5
  }
]
```

**Fields:**
- `name` (string): Name of the game
- `lastPlayed` (string | null): Last played date in YYYY-MM-DD format, or `null` if never played
- `minPlayers` (number, optional): Minimum number of players
- `maxPlayers` (number, optional): Maximum number of players

You can manually edit this file or use the `/addgame` and `/removegame` commands.

## Development

### Project Structure

```
src/
├── bot.ts                 # Main entry point
├── commands/              # Slash command handlers
│   ├── roll.ts
│   ├── addgame.ts
│   └── removegame.ts
├── services/              # Business logic
│   ├── gameService.ts     # Game filtering and selection
│   ├── gameDataService.ts # Game data persistence
│   ├── embedService.ts    # Discord embed creation
│   ├── postService.ts     # Posting games to channels
│   └── schedulerService.ts # Cron scheduling
├── types/                 # TypeScript type definitions
│   └── index.ts
└── utils/                 # Utilities
    ├── config.ts          # Config loader
    └── setup.ts           # Command registration
```

### Scripts

- `npm run dev` - Start bot in development mode with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start bot in production mode (requires build first)

## License

MIT

## Author

Alex Ottr <alex@otter.foo>
