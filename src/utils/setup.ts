import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { BotConfig } from "../types";
import { buildCommand as buildRollCommand } from "../commands/roll";
import { buildCommand as buildAddGameCommand } from "../commands/addgame";
import { buildCommand as buildRemoveGameCommand } from "../commands/removegame";

export async function getApplicationId(): Promise<string | null> {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    
    try {
        const application = await rest.get(Routes.oauth2CurrentApplication()) as { id: string };
        return application.id;
    } catch (error) {
        console.error('Error fetching application ID:', error);
        return null;
    }
}

export async function _registerCommands(applicationId: string, restClient: REST, commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
    const DEV_GUILD_ID = '886325404984549386';
    await restClient.put(
        // Routes.applicationCommands(clientId),
        Routes.applicationGuildCommands(applicationId, DEV_GUILD_ID),
        { body: commands }
    );
}

export async function registerCommands(config: BotConfig) {
    console.log('Registering commands...');

    const commands = [
        buildRollCommand(config),
        buildAddGameCommand(),
        buildRemoveGameCommand()
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
        console.log('Started refreshing application (/) commands.');
        await _registerCommands(config.applicationId, rest, commands);
        console.log('Successfully reloaded application (/) commands.');
    } catch (error: any) {
        if (error.code === 10002) {
            console.error('Error: Unknown Application. The applicationId in config.yml does not match your bot\'s Application ID.');
            console.error('Attempting to fetch the correct Application ID from Discord...');
            
            const correctId = await getApplicationId();
            if (correctId) {
                console.log(`Your bot's Application ID is: ${correctId}`);
                console.log(`Please update applicationId in config.yml to: ${correctId}`);
                
                try {
                    await _registerCommands(correctId, rest, commands);
                    console.log('Successfully registered commands using auto-detected Application ID!');
                } catch (retryError) {
                    console.error('Error registering commands with auto-detected ID:', retryError);
                }
            } else {
                console.error('Could not automatically fetch Application ID. Please check your bot token and try again.');
            }
        } else {
            console.error('Error registering commands:', error);
        }
    }
}