
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const myDB = require('./myDB')

myDB.createConnection();

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders){   // loading commands (humbly stolen from https://discordjs.guide, along with the command setup)
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property`);
        }
    }
}

client.on(Events.ClientReady, readyClient => {
    console.log(`logged in as ${readyClient.user.tag}`);    // make sure the bot tells me it's alive
});

client.on(Events.ShardDisconnect, (event, id) => {
    console.log(`Shard Disconnect: ${event} | ${id}`);
    myDB.closeConnection();
})

// command handling (also stolen from https://discordjs.guide (holy shit it's a great guide, I even managed to learn to use NodeJS from it ^v^))
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command){
        console.error(`no command matching ${interaction.command} was found.`)
        return;
    }
    try{
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred){
            await interaction.followUp({ content: `There was an error while executing this command!`, flags: MessageFlags.Ephemeral})
        } else{
            await interaction.reply({ content: `There was an error while executing this command!`, flags: MessageFlags.Ephemeral})
        }
    }
});

client.login(token);