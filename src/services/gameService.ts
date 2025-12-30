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

export function getRecentlyPlayedGames(games: Game[], daysThreshold: number = 30): Game[] {
    const now = new Date();
    const thresholdDate = new Date(now);
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    return games.filter(game => {
        if (game.lastPlayed === null) {
            return false; // Never played games are not "recently played"
        }
        const lastPlayedDate = new Date(game.lastPlayed);
        return lastPlayedDate >= thresholdDate;
    });
}

export function getGamesFillingCount(
    allGames: Game[],
    requestedCount: number,
    daysThreshold: number,
    playerCount?: number
): Game[] {
    // Filter by player count first
    let playerFilteredGames = playerCount 
        ? filterByPlayers(allGames, playerCount)
        : allGames;

    if (playerFilteredGames.length === 0) {
        return [];
    }

    // Get unplayed games
    let unplayedGames = getUnplayedGames(playerFilteredGames, daysThreshold);
    
    // Get recently played games as fallback
    let recentlyPlayedGames = getRecentlyPlayedGames(playerFilteredGames, daysThreshold);
    
    // Select from unplayed games first
    const selectedGames: Game[] = [];
    const unplayedSelected = selectRandomGames(unplayedGames, requestedCount);
    selectedGames.push(...unplayedSelected);
    
    // fill up from recently played games if needed
    if (selectedGames.length < requestedCount && recentlyPlayedGames.length > 0) {
        // Filter out already selected games
        const recentlyPlayedFiltered = recentlyPlayedGames.filter(
            game => !selectedGames.some(selected => selected.name === game.name)
        );
        const remainingCount = requestedCount - selectedGames.length;
        const additionalGames = selectRandomGames(recentlyPlayedFiltered, remainingCount);
        selectedGames.push(...additionalGames);
    }
    
    return selectedGames;
}

