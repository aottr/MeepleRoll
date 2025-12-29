import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadConfig } from './utils/config';
import { setupScheduledPosts } from './services/schedulerService';
import { execute as rollCommandExecute } from './commands/roll';
import { execute as addGameExecute } from './commands/addgame';
import { execute as removeGameExecute, handleAutocomplete as removeGameAutocomplete } from './commands/removegame';
import { registerCommands } from './utils/setup';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let config: ReturnType<typeof loadConfig>;


client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    await registerCommands(config);
    setupScheduledPosts(client, config);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'roll') {
            await rollCommandExecute(interaction, config);
        } else if (interaction.commandName === 'addgame') {
            await addGameExecute(interaction);
        } else if (interaction.commandName === 'removegame') {
            await removeGameExecute(interaction);
        }
    } else if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'removegame') {
            await removeGameAutocomplete(interaction);
        }
    }
});

client.on('error', console.error);
process.on('unhandledRejection', console.error);

// Load config and start bot
try {
    config = loadConfig();
    
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
        console.error('DISCORD_TOKEN must be set in environment variables');
        process.exit(1);
    }

    client.login(token);
} catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
}
