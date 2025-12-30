import { SlashCommandBuilder, type ChatInputCommandInteraction, type SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { getGamesFillingCount } from '../services/gameService';
import { createGamesEmbed, createGameButtons } from '../services/embedService';
import type { BotConfig } from '../types/index';
import { loadGames } from '../services/gameDataService';

export function buildCommand(config: BotConfig): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Get random board game suggestions')
        .addIntegerOption(option =>
            option
                .setName('count')
                .setDescription(`Number of games to suggest (default: ${config.defaultGameCount})`)
                .setMinValue(1)
                .setMaxValue(config.maxGameCount)
        )
        .addIntegerOption(option =>
            option
                .setName('players')
                .setDescription(`Number of players (default: ${config.defaultPlayerCount})`)
                .setMinValue(1)
                .setMaxValue(config.maxPlayerCount)
        );
}

export async function execute(interaction: ChatInputCommandInteraction, config: BotConfig): Promise<void> {
    await interaction.deferReply();

    const count = interaction.options.getInteger('count') ?? config.defaultGameCount;
    const playerCount = interaction.options.getInteger('players') ?? config.defaultPlayerCount;

    // Validate count
    const validCount = Math.min(Math.max(1, count), config.maxGameCount);
    const validPlayerCount = Math.min(Math.max(1, playerCount), config.maxPlayerCount);

    const allGames = loadGames();
    const selectedGames = getGamesFillingCount(
        allGames,
        validCount,
        config.daysThreshold,
        validPlayerCount
    );
    const embed = createGamesEmbed(selectedGames, validPlayerCount);
    const components = createGameButtons(selectedGames, validPlayerCount, validCount);
    await interaction.editReply({ embeds: [embed], components });
}

