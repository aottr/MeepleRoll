import type { ButtonInteraction } from 'discord.js';
import type { BotConfig } from '../types/index';
import { markGameAsPlayed, loadGames } from '../services/gameDataService';
import { getGamesFillingCount } from '../services/gameService';
import { createGamesEmbed, createGameButtons } from '../services/embedService';

export async function handleButtonInteraction(interaction: ButtonInteraction, config: BotConfig): Promise<void> {
    const customId = interaction.customId;
    
    if (customId.startsWith('markplayed:')) {
        await handleMarkPlayed(interaction, customId);
    } else if (customId.startsWith('reroll:')) {
        await handleReroll(interaction, customId, config);
    }
}

async function handleMarkPlayed(interaction: ButtonInteraction, customId: string): Promise<void> {
    await interaction.deferUpdate();
    
    const gameNameFromId = customId.substring('markplayed:'.length);
    
    // Find the exact game name (case-insensitive match)
    const games = loadGames();
    let game = games.find(g => g.name.toLowerCase() === gameNameFromId.toLowerCase());
    
    // If not found, try to find by prefix match in case of truncation
    if (!game) {
        game = games.find(g => g.name.toLowerCase().startsWith(gameNameFromId.toLowerCase()));
    }
    
    if (!game) {
        await interaction.followUp({
            content: `Game not found.`,
            ephemeral: true
        });
        return;
    }
    
    const result = markGameAsPlayed(game.name);
    
    await interaction.followUp({
        content: result.message,
        ephemeral: false
    });
}

async function handleReroll(interaction: ButtonInteraction, customId: string, config: BotConfig): Promise<void> {
    await interaction.deferUpdate();
    
    // Parse reroll parameters: reroll:playerCount:count
    const parts = customId.substring('reroll:'.length).split(':');
    const playerCountStr = parts[0];
    const countStr = parts[1];
    
    const playerCount = playerCountStr === 'none' ? undefined : parseInt(playerCountStr, 10);
    const count = parseInt(countStr, 10) || config.defaultGameCount;
    
    const allGames = loadGames();
    const selectedGames = getGamesFillingCount(
        allGames,
        count,
        config.daysThreshold,
        playerCount
    );
    const embed = createGamesEmbed(selectedGames, playerCount);
    const components = createGameButtons(selectedGames, playerCount, count);
    
    await interaction.editReply({ embeds: [embed], components });
}

