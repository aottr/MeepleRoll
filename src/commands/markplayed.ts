import { SlashCommandBuilder, type ChatInputCommandInteraction, type AutocompleteInteraction, EmbedBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { markGameAsPlayed, loadGames } from '../services/gameDataService';

export function buildCommand(): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName('markplayed')
        .setDescription('Mark a game as played')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name of the game to mark as played')
                .setRequired(true)
                .setAutocomplete(true)
        );
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const gameName = interaction.options.getString('name', true);

    const result = markGameAsPlayed(gameName);

    const embed = new EmbedBuilder()
        .setTitle(result.success ? '✅ Game Marked as Played' : '❌ Error')
        .setDescription(result.message)
        .setColor(result.success ? 0x57F287 : 0xFF6B6B)
        .setTimestamp();

    if (result.success && result.game) {
        const details: string[] = [];
        
        if (result.game.lastPlayed) {
            details.push(`Last played: ${result.game.lastPlayed}`);
        }
        
        if (details.length > 0) {
            embed.addFields({
                name: 'Game Details',
                value: details.join('\n'),
                inline: false
            });
        }
    }

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

