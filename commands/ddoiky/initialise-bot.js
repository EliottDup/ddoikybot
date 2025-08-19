const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ChatInputCommandInteraction, InteractionContextType, CacheType, TextChannel, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const db = require('../../myDB');
const dbUtils = require("../../dbUtils");
const utils = require("../../utils");



module.exports = {
    data: new SlashCommandBuilder()
        .setName('initialise')
        .addChannelOption(option => 
            option.addChannelTypes(ChannelType.GuildText)
            .setName('main-channel')
            .setDescription('The main channel for this server, ddoikybot will use this channel to make announcements.')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Initializes the bot for usage on this server")
        .setContexts(InteractionContextType.Guild),


    async execute(/** @type {ChatInputCommandInteraction<CacheType>} **/ interaction){
        /**@type {TextChannel} */
        const channel = interaction.options.getChannel('main-channel') ?? interaction.channel;

        const successEmbed = new EmbedBuilder().setColor(0x00ff00)
            .setTitle("Initialization Success")
            .setDescription(`DDoikyBot has been successfully initiated and will use ${channel} for announcements`);

        const failureEmbed = new EmbedBuilder().setColor(0xff0000)
            .setTitle("Initialization Failed")
            .setDescription(`DDoikyBot is already initiated on this server. \n Would you like to move the active channel to the selected channel?`);
        const moveActiveChannel = new ButtonBuilder()
            .setCustomId('move')
            .setLabel('Move')
            .setStyle(ButtonStyle.Primary);
        const noMoveActiveChannel = new ButtonBuilder()
            .setCustomId('noMove')
            .setLabel('Don\'t')
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(moveActiveChannel, noMoveActiveChannel);
        
        dbUtils.serverExists(interaction.guildId).then(async exists => {
            if (!exists){
                dbUtils.createServer(interaction.guildId, channel.id).then(() => utils.updateStatsMessage(interaction.guild));
                interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
                console.log(`added server ${interaction.guildId} to database`);
            } else{
                const response = await interaction.reply({embeds: [failureEmbed], flags: MessageFlags.Ephemeral, components: [row], withResponse: true});

                try {
                    const confirmation = await response.resource.message.awaitMessageComponent({time: 60_000});
                    
                    if (confirmation.customId === "move") {
                        dbUtils.updateServerMainChannel(interaction.guildId, channel.id).then(() => utils.updateStatsMessage(interaction.guild));
                        await interaction.editReply({embeds: [successEmbed], components: []});
                    }
                    else {
                        await interaction.editReply({embeds: [failureEmbed.setDescription("Action aborted")], components: []})
                    }

                } catch {
                    await interaction.editReply({embeds: [failureEmbed.setDescription("No option was selected, aborting")], components: []})
                }
            }
        })

    }
};