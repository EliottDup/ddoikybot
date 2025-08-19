const { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("start-ddoiky")
        .setDescription("unfinished"),
    async execute(/** @type {ChatInputCommandInteraction<CacheType>} */ interaction){
        interaction.reply({content: "Unfinished, what are you doing?", flags: MessageFlags.Ephemeral});
    }
}