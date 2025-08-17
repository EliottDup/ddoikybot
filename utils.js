const { EmbedBuilder } = require("discord.js");
const dbUtils = require("./dbUtils");


module.exports = {
    getStatusEmbeds(serverID){
        return dbUtils.getAllServerData(serverID).then( data => {
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
    }
}