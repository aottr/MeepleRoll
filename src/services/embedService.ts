import { EmbedBuilder } from 'discord.js';
import type { Game } from '../types/index';

export function createGamesEmbed(games: Game[], playerCount?: number): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle('🎲 Board Game Suggestions')
        .setColor(0x5865F2)
        .setTimestamp()
        .setFooter({ text: 'MeepleRoll - No repeats, no thinking, just play' });

    if (playerCount) {
        embed.setDescription(`Games for **${playerCount} player${playerCount !== 1 ? 's' : ''}**:`);
    } else {
        embed.setDescription('Here are some games you haven\'t played recently:');
    }

    games.forEach((game, index) => {
        const details: string[] = [];

        if (game.minPlayers || game.maxPlayers) {
            if (game.minPlayers === game.maxPlayers) {
                details.push(`${game.minPlayers} player${game.minPlayers !== 1 ? 's' : ''}`);
            } else {
                details.push(`${game.minPlayers ?? 1}-${game.maxPlayers} players`);
            }
        }

        if (game.lastPlayed) {
            const lastPlayedDate = new Date(game.lastPlayed);
            const daysAgo = Math.floor((Date.now() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24));
            details.push(`Last played: ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`);
        } else {
            details.push('Never played');
        }

        embed.addFields({
            name: `${index + 1}. ${game.name}`,
            value: details.length > 0 ? details.join(' • ') : '\u200b',
            inline: false
        });
    });

    if (games.length === 0) {
        embed.setDescription('No games found matching your criteria.');
    }

    return embed;
}

export function createEmptyEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('🎲 Board Game Suggestions')
        .setDescription(message)
        .setColor(0xFF6B6B)
        .setTimestamp();
}

