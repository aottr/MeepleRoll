import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Game } from '../types/index';

const GAMES_FILE_PATH = join(process.cwd(), 'data', 'games.json');

export function loadGames(): Game[] {
    try {
        const gamesData = readFileSync(GAMES_FILE_PATH, 'utf-8');
        return JSON.parse(gamesData);
    } catch (error) {
        console.error('Error loading games:', error);
        return [];
    }
}

export function saveGames(games: Game[]): void {
    try {
        const gamesData = JSON.stringify(games, null, 2);
        writeFileSync(GAMES_FILE_PATH, gamesData, 'utf-8');
    } catch (error) {
        console.error('Error saving games:', error);
        throw new Error('Failed to save games to file');
    }
}

export function addGame(game: Game): { success: boolean; message: string } {
    const games = loadGames();
    
    // Check if game already exists
    const existingGame = games.find(g => g.name.toLowerCase() === game.name.toLowerCase());
    if (existingGame) {
        return { success: false, message: `Game "${game.name}" already exists in your collection.` };
    }
    
    games.push(game);
    saveGames(games);
    
    return { success: true, message: `Successfully added "${game.name}" to your collection!` };
}

export function removeGame(gameName: string): { success: boolean; message: string } {
    const games = loadGames();
    
    const gameIndex = games.findIndex(g => g.name.toLowerCase() === gameName.toLowerCase());
    if (gameIndex === -1) {
        return { success: false, message: `Game "${gameName}" not found in your collection.` };
    }
    
    const removedGame = games[gameIndex];
    games.splice(gameIndex, 1);
    saveGames(games);
    
    return { success: true, message: `Successfully removed "${removedGame.name}" from your collection!` };
}

export function markGameAsPlayed(gameName: string): { success: boolean; message: string; game?: Game } {
    const games = loadGames();
    
    const gameIndex = games.findIndex(g => g.name.toLowerCase() === gameName.toLowerCase());
    if (gameIndex === -1) {
        return { success: false, message: `Game "${gameName}" not found in your collection.` };
    }
    
    const game = games[gameIndex];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    game.lastPlayed = today;
    
    saveGames(games);
    
    return { 
        success: true, 
        message: `Successfully marked "${game.name}" as played!`,
        game 
    };
}

