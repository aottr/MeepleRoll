import { SlashCommandBuilder, type ChatInputCommandInteraction, type AutocompleteInteraction, EmbedBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { removeGame, loadGames } from '../services/gameDataService';

export function buildCommand(): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName('removegame')
        .setDescription('Remove a board game from your collection')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name of the game to remove')
                .setRequired(true)
                .setAutocomplete(true)
        );
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const gameName = interaction.options.getString('name', true);

    const result = removeGame(gameName);

    const embed = new EmbedBuilder()
        .setTitle(result.success ? '✅ Game Removed' : '❌ Error')
        .setDescription(result.message)
        .setColor(result.success ? 0x57F287 : 0xFF6B6B)
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

export async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused();
    const games = loadGames();

    // Filter games that match the focused value
    const filtered = games
        .filter(game => game.name.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25); // Discord allows max 25 choices

    await interaction.respond(
        filtered.map(game => ({
            name: game.name,
            value: game.name
        }))
    );
}

