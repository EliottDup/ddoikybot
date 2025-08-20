const { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } = require("discord.js");
const { ensureChannelExists, updateStatsMessage } = require("../../utils");
const { canMakeChannel } = require("../../dbUtils");
const dbUtils = require("../../dbUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rename-streak")
        .setDescription("Rename a channel streak")
        .addStringOption(option => 
            option
            .setName("new-name")
            .setMaxLength(255)
            .setDescription("The new name for this streak")
            .setRequired(true)
        ),
    async execute(/** @type {ChatInputCommandInteraction<CacheType>} **/ interaction){
        ensureChannelExists(interaction, () => {
            let newName = interaction.options.getString("new-name");
            if (canMakeChannel(interaction.guildId, 0, newName)){
                dbUtils.renameChannel(interaction.channelId, newName).then(() => updateStatsMessage(interaction.guild)).then(() => interaction.reply({content: `Streak renamed to ${newName}`, flags: MessageFlags.Ephemeral}));

            }
        });
    }
};