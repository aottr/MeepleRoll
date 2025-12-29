import type { Client, TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { getUnplayedGames, filterByPlayers, selectRandomGames } from './gameService';
import { createGamesEmbed, createEmptyEmbed } from './embedService';
import { loadGames } from './gameDataService';

export async function postGames(
    client: Client,
    channelId: string,
    count: number = 3,
    daysThreshold: number = 30,
    playerCount?: number
) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
        console.error('Channel not found or not a text channel');
        return;
    }

    const sendableChannel = channel as TextChannel | NewsChannel | ThreadChannel;
    let unplayedGames = getUnplayedGames(loadGames(), daysThreshold);

    if (playerCount) {
        unplayedGames = filterByPlayers(unplayedGames, playerCount);
    }

    if (unplayedGames.length === 0) {
        const embed = createEmptyEmbed('No games found that match your criteria. You might want to add more games or adjust your filters!');
        await sendableChannel.send({ embeds: [embed] });
        return;
    }

    const selectedGames = selectRandomGames(unplayedGames, count);
    const embed = createGamesEmbed(selectedGames, playerCount);
    await sendableChannel.send({ embeds: [embed] });
}

