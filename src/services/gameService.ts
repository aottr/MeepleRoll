import type { Game } from '../types/index';

export function getUnplayedGames(games: Game[], daysThreshold: number = 30): Game[] {
    const now = new Date();
    const thresholdDate = new Date(now);
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    return games.filter(game => {
        if (game.lastPlayed === null) {
            return true; // Never played
        }
        const lastPlayedDate = new Date(game.lastPlayed);
        return lastPlayedDate < thresholdDate;
    });
}

export function filterByPlayers(games: Game[], playerCount: number): Game[] {
    return games.filter(game => {
        const min = game.minPlayers ?? 1;
        const max = game.maxPlayers ?? 99;
        return playerCount >= min && playerCount <= max;
    });
}

export function selectRandomGames(games: Game[], count: number): Game[] {
    const shuffled = [...games].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, games.length));
}

