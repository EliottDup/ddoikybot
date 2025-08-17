const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('replies with Hello World!'),
    async execute(interaction) {
        await interaction.reply({content: "Hello World!", flags: MessageFlags.Ephemeral});
    }
}