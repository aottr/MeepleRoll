export type Game = {
    name: string;
    lastPlayed: string | null;
    minPlayers?: number;
    maxPlayers?: number;
}

export type BotConfig = {
    applicationId: string;
    channelId: string;
    cronSchedule: string;
    timezone: string;
    defaultGameCount: number;
    defaultPlayerCount: number;
    daysThreshold: number;
    maxGameCount: number;
    maxPlayerCount: number;
}

export type ConfigFile = {
    applicationId?: string;
    channelId?: string;
    cronSchedule?: string;
    timezone?: string;
    defaultGameCount?: number;
    defaultPlayerCount?: number;
    daysThreshold?: number;
    maxGameCount?: number;
    maxPlayerCount?: number;
}