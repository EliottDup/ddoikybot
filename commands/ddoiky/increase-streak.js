const { SlashCommandBuilder, InteractionContextType, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } = require("discord.js");
const utils = require("../../utils");
const dbUtils = require("../../dbUtils");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("idrew")
    .setDescription("Use this command to confirm having drawn today")
    .setContexts(InteractionContextType.Guild),

    async execute(/** @type {ChatInputCommandInteraction<CacheType>} */ interaction){
        utils.ensureChannelExists(interaction, () => {
            dbUtils.getDrawCounter(interaction.channelId).then(d => {
                console.log(d.streak + 1);
                const alreadyIncrementedEmbed = new EmbedBuilder()
                    .setColor(0xffff00)
                    .setTitle("Streak already increased today.");

                const streakIncreasedEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle("Streak successfully increased!")
                    .addFields({name: "Current streak:", value: (d.streak + 1).toString()});

                const streakIncreasedLateEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle("Streak successfully increased!")
                    .addFields({name: "Current streak:", value: (d.streak + 1).toString()})
                    .setDescription("Today's drawing was late, just a heads up");

                let now = new Date();

                if (!d){
                    interaction.reply({content: "Oops, something went wrong and this channel is fucked or something, please ping c0der23 :)))"});
                    return;
                }

                let isLate = d.counter == 0 && now.getHours() < 5;
                let canIncrement = d.counter < 2 && now.getHours() < 5 || d.counter < 1;

                if (!canIncrement){
                    interaction.reply({embeds: [alreadyIncrementedEmbed], flags: MessageFlags.Ephemeral});
                }
                else {
                    dbUtils.incrementStreakAndDrawCounter(interaction.channelId).then(() => {
                        utils.updateStatsMessage(interaction.guild).then(() => {
                            interaction.reply(
                                {embeds: [isLate? streakIncreasedLateEmbed : streakIncreasedEmbed], flags: MessageFlags.Ephemeral}
                            );
                        });
                    });
                }
            });
        });
    }
}