const { SlashCommandBuilder, CacheType, ChannelType, ChatInputCommandInteraction, InteractionContextType, MessageFlags, EmbedBuilder } = require("discord.js");
const { getServerDDoikyActive } = require("../../dbUtils");
const dbUtils = require("../../dbUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .addStringOption(option =>
            option.setName('name')
            .setDescription('The name for this channel')
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
            .setDescription(`Either ${channel} is already counting a streak, or there is already a streak started on this server named \`${name}\``);

        const successEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`Registration Successful!`)
            .setDescription(`The registration was successful, the `)

    

        dbUtils.canMakeChannel(interaction.guildId, channel.id, name).then(canMake => {
            if (canMake){
                dbUtils.createChannel(interaction.guildId, channel.id, name);

            } else {
                interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            }
        });

        dbUtils.serverExists(interaction.guildId).then(v => console.log(v));
    }
}