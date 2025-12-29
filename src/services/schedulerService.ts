import cron from 'node-cron';
import type { Client } from 'discord.js';
import type { BotConfig } from '../types/index';
import { postGames } from './postService';

export function setupScheduledPosts(client: Client, config: BotConfig) {
    console.log(`Setting up scheduled posts with cron: ${config.cronSchedule}`);

    cron.schedule(config.cronSchedule, () => {
        console.log('Running scheduled game post...');
        postGames(client, config.channelId, config.defaultGameCount, config.daysThreshold).catch(console.error);
    }, {
        timezone: config.timezone
    });
}

