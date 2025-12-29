import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { addGame } from '../services/gameDataService';
import type { Game } from '../types/index';

export function buildCommand(): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName('addgame')
        .setDescription('Add a new board game to your collection')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name of the game')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('minplayers')
                .setDescription('Minimum number of players')
                .setMinValue(1)
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('maxplayers')
                .setDescription('Maximum number of players')
                .setMinValue(1)
                .setRequired(true)
        )
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const name = interaction.options.getString('name', true);
    const minPlayers = interaction.options.getInteger('minplayers', true);
    const maxPlayers = interaction.options.getInteger('maxplayers', true);

    const game: Game = {
        name,
        lastPlayed: null,
        minPlayers,
        maxPlayers,
    };

    const result = addGame(game);

    const embed = new EmbedBuilder()
        .setTitle(result.success ? '✅ Game Added' : '❌ Error')
        .setDescription(result.message)
        .setColor(result.success ? 0x57F287 : 0xFF6B6B)
        .setTimestamp();

    if (result.success) {
        const details: string[] = [];
        if (game.minPlayers || game.maxPlayers) {
            if (game.minPlayers === game.maxPlayers) {
                details.push(`${game.minPlayers} player${game.minPlayers !== 1 ? 's' : ''}`);
            } else {
                details.push(`${game.minPlayers ?? 1}-${game.maxPlayers} players`);
            }
        }
        details.push('Never played');
        if (details.length > 0) {
            embed.addFields({
                name: 'Game Details',
                value: details.join(' • '),
                inline: false
            });
        }
    }

    await interaction.editReply({ embeds: [embed] });
}

