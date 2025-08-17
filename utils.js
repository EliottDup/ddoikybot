const { EmbedBuilder, MessageFlags, Channel } = require("discord.js");
const dbUtils = require("./dbUtils");


module.exports = {
    getStatusEmbeds(serverID){
        return dbUtils.getAllServerData(serverID).then( data => {
            console.log(data);
            if (!data.server.id){
                return [new EmbedBuilder().setColor(0xffff00).setTitle("DDoiky Not Setup").setDescription("Use `/initialise` to setup ddoikyBot")]
            }
            const statsEmbed = new EmbedBuilder().setColor(0xffff00)
            .setTitle("Statistics")
            .setDescription(`DDoiky Status: ${data.server.ddoiky_active == 1 ? `active` : `inactive` }`)
            .addFields({name: "Last Updated:", value: `<t:${Math.floor(Date.now()/1000)}:R>`});
        
            let allEmbeds = [statsEmbed];
        
            let allFields = [];
            data.streaks.forEach(streak => {
                allFields.push(
                    { name: '\u200B', value: '\u200B' },
                    { name: streak.name, value: streak.is_alive == 1 ? 'Alive' : 'Dead', inline: true },
                    { name: 'Streak', value: streak.streak.toString(), inline: true },
                    { name: 'High Score', value: streak.high_streak.toString(), inline: true },
                )
            });

            while (allFields.length > 0){
                const newEmbed = new EmbedBuilder()
                    .setColor(0xffff00)
                    .addFields(allFields.splice(Math.max(allFields.length - 4*6, 0)).splice(1));
                allEmbeds.push(newEmbed);
            }
            return allEmbeds;
        });
    },
    updateStatsMessage(serverID, client){
        return dbUtils.getServerMainChannel(serverID, client).then(channel => {
            console.log(channel);
            if (channel == null) return null;
            return this.getStatusEmbeds(serverID, client).then(embeds => {
                return channel.send({contents: "@silent", embeds: embeds});
            })
        })
    },
    ensureServerExists(interaction, callback){
        dbUtils.serverExists(interaction.guildId).then( exists => {
            if (!exists){
                interaction.reply({embeds: [new EmbedBuilder().setColor(0xffff00).setTitle("DDoiky Not Setup").setDescription("Use `/initialise` to setup ddoikyBot")], flags:MessageFlags.Ephemeral})
            }
            else{
                callback(interaction)
            }
        });
    },
    ensureChannelExists(interaction, callback){
            dbUtils.channelExists(interaction.channelId).then( exists => {
            if (!exists){
                interaction.reply({embeds: [new EmbedBuilder().setColor(0xffff00).setTitle("DDoiky Not Setup In This Channel").setDescription("Use `/register` to setup ddoikyBot in this channel")], flags:MessageFlags.Ephemeral})
            }
            else{
                callback(interaction)
            }
        });
    },
}