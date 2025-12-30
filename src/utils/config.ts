import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';
import type { BotConfig, ConfigFile } from '../types/index';

dotenv.config();

function loadConfigFile(): ConfigFile {
    const configPaths = [
        join(process.cwd(), 'config', 'config.yml'),
        join(process.cwd(), 'config.yml')
    ];
    
    for (const configPath of configPaths) {
        if (!existsSync(configPath)) {
            continue;
        }
        try {
            const fileContents = readFileSync(configPath, 'utf-8');
            const config = yaml.load(fileContents) as ConfigFile;
            return config || {};
        } catch (error) {
            console.error(`Error loading config from ${configPath}:`, error);
        }
    }
    console.warn('config.yml not found in config/config.yml or root, using defaults and environment variables');
    return {};
}

function getEnvValue(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): BotConfig {
    const fileConfig = loadConfigFile();

    // Load from config file, then override with environment variables
    const config: BotConfig = {
        applicationId: getEnvValue('APPLICATION_ID') || fileConfig.applicationId || '',
        channelId: getEnvValue('CHANNEL_ID') || fileConfig.channelId || '',
        cronSchedule: getEnvValue('CRON_SCHEDULE') || fileConfig.cronSchedule || '0 9 * * 0',
        timezone: getEnvValue('TZ') || fileConfig.timezone || 'Europe/Paris',
        defaultGameCount: getEnvNumber('DEFAULT_GAME_COUNT') ?? fileConfig.defaultGameCount ?? 3,
        defaultPlayerCount: getEnvNumber('DEFAULT_PLAYER_COUNT') ?? fileConfig.defaultPlayerCount ?? 2,
        daysThreshold: getEnvNumber('DAYS_THRESHOLD') ?? fileConfig.daysThreshold ?? 30,
        maxGameCount: getEnvNumber('MAX_GAME_COUNT') ?? fileConfig.maxGameCount ?? 10,
        maxPlayerCount: getEnvNumber('MAX_PLAYER_COUNT') ?? fileConfig.maxPlayerCount ?? 20,
    };

    // Validate required fields
    if (!config.applicationId) {
        throw new Error('applicationId must be set in config.yml or environment variables');
    }
    if (!config.channelId) {
        throw new Error('channelId must be set in config.yml or environment variables');
    }

    return config;
}

