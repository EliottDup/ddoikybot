const { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, EmbedBuilder } = require("discord.js");
const dbUtils = require("../../dbUtils");
const utils = require("../../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription("display the server's stats"),
    async execute(/** @type {ChatInputCommandInteraction} */ interaction){
        utils.getStatusEmbeds(interaction.guildId).then(embeds => 
            interaction.reply({embeds: embeds, flags: MessageFlags.Ephemeral})
        );
    }
};