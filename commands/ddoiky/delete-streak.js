const {EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, Embed } = require("discord.js");
const { deleteStreak } = require("../../dbUtils");
const dbUtils = require("../../dbUtils");
const { ensureChannelExists } = require("../../utils");
const utils = require("../../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-streak')
        .setDescription('Delete this streak from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName("channelid")
            .setDescription("The ID of the current channel, for confirmation purposes")
            .setRequired(true)
        ).addStringOption(option => 
            option.setName("confirmation")
            .setDescription("This should be the string `confirm`")
            .setRequired(true)
        ).setContexts(InteractionContextType.Guild),

    async execute(/** @type {ChatInputCommandInteraction<CacheType>} **/ interaction){
        ensureChannelExists(interaction, interaction => {
            const failureEmbed = new EmbedBuilder().setColor(0xff0000)
            .setTitle("Deletion denied")
            .setDescription("Deletion aborted, `channelid` and/or `confirmation` are invalid.")
            .setAuthor({name: interaction.user.displayName, iconURL: interaction.user.avatarURL()});
            
            const successEmbed = new EmbedBuilder().setColor(0xff0000)
            .setTitle("Deletion Successful")
            .setDescription("No more ddoiky for you :(")
            .setAuthor({name: interaction.user.displayName, iconURL: interaction.user.avatarURL()});

            dbUtils.getStreakName(interaction.channelId);

            const channelid = interaction.options.getString("channelid");
            const confirmation = interaction.options.getString("confirmation");
            if (channelid === interaction.channelId && confirmation == "confirm"){
                deleteStreak(interaction.channelId);
                interaction.reply({embeds: [successEmbed]});
            }
            else{
                interaction.reply({embeds: [failureEmbed]});
            }
        });
    }
}