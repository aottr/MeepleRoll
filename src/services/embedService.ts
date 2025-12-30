import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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

export function createGameButtons(games: Game[], playerCount?: number, count?: number): ActionRowBuilder<ButtonBuilder>[] {
    // Don't show buttons if there are no games
    if (games.length === 0) {
        return [];
    }
    
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    const maxButtonsPerRow = 5; // Discord allows 5 buttons per row, max 5 rows
    
    // Create buttons for each game
    const gameButtons: ButtonBuilder[] = games.map(game => {
        // Truncate game name if too long (customId max is 100 chars, "markplayed:" is 12 chars)
        const gameNameForId = game.name.length > 88 ? game.name.substring(0, 88) : game.name;
        return new ButtonBuilder()
            .setCustomId(`markplayed:${gameNameForId}`)
            .setLabel(game.name.length > 80 ? `${game.name.substring(0, 77)}...` : game.name)
            .setStyle(ButtonStyle.Primary)
    });
    
    // Add re-roll button
    const rerollPlayerCount = playerCount ?? 'none';
    const rerollCount = count ?? 3;
    const rerollButton = new ButtonBuilder()
        .setCustomId(`reroll:${rerollPlayerCount}:${rerollCount}`)
        .setLabel('Re-roll')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎲');
    
    // Group buttons into rows (max 5 buttons per row)
    for (let i = 0; i < gameButtons.length; i += maxButtonsPerRow) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        const buttonsInRow = gameButtons.slice(i, i + maxButtonsPerRow);
        buttonsInRow.forEach(button => row.addComponents(button));
        rows.push(row);
    }
    
    // Add re-roll button to the last row if there's space, otherwise create a new row
    if (rows.length === 0 || rows[rows.length - 1].components.length >= maxButtonsPerRow) {
        const rerollRow = new ActionRowBuilder<ButtonBuilder>().addComponents(rerollButton);
        rows.push(rerollRow);
    } else {
        rows[rows.length - 1].addComponents(rerollButton);
    }
    
    return rows;
}

export function createEmptyEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('🎲 Board Game Suggestions')
        .setDescription(message)
        .setColor(0xFF6B6B)
        .setTimestamp();
}

