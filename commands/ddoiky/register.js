const { SlashCommandBuilder, CacheType, ChannelType, ChatInputCommandInteraction, InteractionContextType, MessageFlags, EmbedBuilder } = require("discord.js");
const { getServerDDoikyActive } = require("../../dbUtils");
const dbUtils = require("../../dbUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .addStringOption(option =>
            option.setName('name')
            .setDescription('The name for this channel')
            .setMaxLength(255)
            .setRequired(true)
        )
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to register a user in')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .setDescription('registers a user into a channel')
        .setContexts(InteractionContextType.Guild),
    async execute(/** @type {ChatInputCommandInteraction<CacheType>} **/ interaction){
        const name = interaction.options.getString('name');
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;

        const errorEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`Registration failed`)
            .setDescription(`Possible reasons are:\n - ${channel} is already counting a streak.\n - there is already a streak started on this server named \`${name}\`\n - The bot has not been set up on this server.`);

        const successEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`Registration Successful!`)
            .setDescription(`The channel ${channel} has started the streak: ${name}`);

        dbUtils.canMakeChannel(interaction.guildId, channel.id, name).catch(err =>{ 
            throw err;
        }).then(canMake => {
            if (canMake){
                dbUtils.createChannel(interaction.guildId, channel.id, name);
                interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
                console.log(`created streak ${name} in channel ${channel} in server ${interaction.guildId}`)
            } else {
                interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            }
        });
    }
}