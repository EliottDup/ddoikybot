const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, MessageFlags, EmbedBuilder } = require("discord.js");
const { deleteServer } = require("../../dbUtils");
const dbUtils = require("../../dbUtils");
const { ensureServerExists, updateStatsMessage } = require("../../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-ddoiky')
        .setDescription('Delete this server from the database')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName("serverid")
            .setDescription("The ID of the Current server, for confirmation purposes")
            .setRequired(true)
        ).addStringOption(option => 
            option.setName("confirmation")
            .setDescription("This should be the string `confirm`")
            .setRequired(true)
        ).setContexts(InteractionContextType.Guild),

    async execute(/** @type {ChatInputCommandInteraction<CacheType>} **/ interaction){
        ensureServerExists(interaction, () => {
            
            const failureEmbed = new EmbedBuilder().setColor(0xff0000)
            .setTitle("Deletion denied")
            .setDescription("Deletion aborted, `serverID` and/or `confirmation` are invalid.")
            .setAuthor({name: interaction.user.displayName, iconURL: interaction.user.avatarURL()});
    
            const successEmbed = new EmbedBuilder().setColor(0xff0000)
            .setTitle("Deletion Successful")
            .setDescription("No more ddoiky :(")
            .setAuthor({name: interaction.user.displayName, iconURL: interaction.user.avatarURL()});

            const serverid = interaction.options.getString("serverid");
            const confirmation = interaction.options.getString("confirmation");
            if (serverid === interaction.guildId && confirmation == "confirm"){
                deleteServer(interaction.guildId);
            }
            else{
                interaction.reply({embeds: [failureEmbed]});
            }});
    }
}