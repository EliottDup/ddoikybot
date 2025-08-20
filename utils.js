const { EmbedBuilder, MessageFlags, Guild, GuildManager, GuildBasedChannel } = require("discord.js");
const dbUtils = require("./dbUtils");
const cron = require("cron");

function ensureServerExists(interaction, callback){
    dbUtils.serverExists(interaction.guildId).then( exists => {
        if (!exists){
            interaction.reply({embeds: [new EmbedBuilder().setColor(0xffff00).setTitle("DDoiky Not Setup").setDescription("Use `/initialise` to setup ddoikyBot")], flags:MessageFlags.Ephemeral})
        }
        else{
            callback()
        }
    });
}

async function checkServer(server, /** @type {Guild} */ guild){
    dbUtils.getAllServerChannels(server.id).then(channels => {
        channels.forEach(channel => 
            guild.channels.fetch(channel.id).then(dcChannel => {
                checkChannel(channel, dcChannel)
            })
        );
    });
}

function checkChannel(channel, /**@type {GuildBasedChannel} */ dcChannel){
    if (channel.draw_counter <= 0){ //DEAD LMAO
        const deathEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`${channel.name}'s streak has been lost!`)
            .setDescription(`The streak was ${channel.streak} days!`);

        channel.is_alive = false;
        if (channel.streak > 0) dcChannel.send({embeds: [deathEmbed]});
        channel.streak = 0;
    }
    else {
        channel.draw_counter -= 1;
    }
    dbUtils.updateChannel(channel);
}

function updateStatsMessage(/** @type {Guild} */ guild){
    return dbUtils.getServerStatMessage(guild).then(msg => {
        if (msg == null) return createStatsMessage(guild);
        return getStatusEmbeds(guild.id).then(embeds => {
            return msg.edit({embeds:embeds});
        });
    }).catch(console.error);
}

function getStatusEmbeds(serverID){
    return dbUtils.getAllServerData(serverID).then( data => {
        if (!data.server.id){
            return [new EmbedBuilder().setColor(0xffff00).setTitle("DDoiky Not Setup").setDescription("Use `/initialise` to setup ddoikyBot")]
        }
        const infoEmbed = new EmbedBuilder()
            .setColor(0x00ff00)    
            .setTitle("DDoikybot Tutorial")
            .setDescription("To start counting a streak in a channel, use `/register <streak_name>` in that channel.\nOnce that has been done, increase your streak daily using `/idrew`.");
        const statsEmbed = new EmbedBuilder().setColor(0xffff00)
        .setTitle("Statistics")
        .setDescription(`DDoiky Status: ${data.server.ddoiky_active == 1 ? `active` : `inactive` }`)
        .addFields( {name: "Last Updated:", value: `<t:${Math.floor(Date.now()/1000)}:R>`},
                    {name: "Deadline:", value: `<t:${Math.floor(Math.floor((Date.now() + cron.timeout("0 0 5 * * *"))/1000))}:R>`});
    
        let allEmbeds = [infoEmbed, statsEmbed];
    
        let allFields = [];
        data.streaks.forEach(streak => {
            allFields.push(
                { name: streak.name, value: data.server.ddoiky_active==1 ? streak.is_alive == 1 ? 'Alive' : 'Dead' : "", inline: true },
                { name: 'Streak', value: streak.streak.toString(), inline: true },
                { name: 'High Score', value: streak.high_streak.toString(), inline: true },
            )
        });
        while (allFields.length > 0){
            const newEmbed = new EmbedBuilder()
                .setColor(0xffff00)
                .setTitle(".                                                           .")
                .addFields(allFields.splice(Math.max(allFields.length - 3*8, 0)));
            allEmbeds.push(newEmbed);
        }
        return allEmbeds;
    });
}

function createStatsMessage(/** @type {Guild} */ guild){
    return dbUtils.getServerMainChannel(guild).then( c => {
        if (c) return getStatusEmbeds(guild.id).then(embeds => {
            return c.send({embeds: embeds})
        });
        return null;
    }).catch(console.error);
}

module.exports = {
    getStatusEmbeds,
    updateStatsMessage,
    createStatsMessage,
    ensureServerExists(interaction, callback){
        ensureServerExists(interaction, callback);
    },
    ensureChannelExists(interaction, callback){
        ensureServerExists(interaction, () => {
            dbUtils.channelExists(interaction.channelId).then( exists => {
                if (!exists){
                    interaction.reply({embeds: [new EmbedBuilder().setColor(0xffff00).setTitle("DDoiky Not Setup In This Channel").setDescription("Use `/register` to setup ddoikyBot in this channel")], flags:MessageFlags.Ephemeral})
                }
                else{
                    callback()
                }
            });
        });
    },
    // YYYY-MM-DD HH:MM
    dateToString(/** @type {Date} */ date){
        const padL = (nr) => `${nr}`.padStart(2, `0`);
        return [date.getFullYear(), padL(date.getMonth()), padL(date.getDate())].join('-') + ' ' + [padL(date.getHours()), padL(date.getMinutes())].join(':');
    },
    theCheckening(/** @type {GuildManager} */ guildManager){
        dbUtils.getAllServers().then(servers => {
            servers.forEach(server => 
                guildManager.fetch(server.id).then(guild => {
                    checkServer(server, guild).then(() => updateStatsMessage(guild));
                })
            );
        });
    },
}