const { Guild } = require("discord.js");
const myDB = require("./myDB");
const utils = require("./utils");

module.exports = {
    getServerMainChannel(/** @type {Guild} */ guild){
        const query = `SELECT main_channel FROM Servers WHERE id = ?`;
        
        return myDB.fetchFirst(query, [guild.id]).then(v => v[0] ? guild.channels.fetch(v[0].main_channel) : null)
    },
    getServerStatMessage(/**@type {Guild} */ guild){
        return this.getServerMainChannel(guild).then(mainChannel =>{
            if (!mainChannel) return null;
            const query = `SELECT stats_message FROM Servers WHERE id = ?`;

            return myDB.fetchFirst(query, [guild.id]).then(m => {
                if (m[0]){
                    return mainChannel.messages.fetch(m[0].stats_message).then(messages => messages.first() ?? null);
                }
                return null;
            })
        })
    },
    setServerStatMessage(server_id, msg){
        const query = `UPDATE Servers
            SET stats_message = ?
            WHERE id = ?`;
        return myDB.executesql(query, [msg, server_id]); 
    },
    getServerDDoikyActive(serverID){
        const getDDoiky = `SELECT ddoiky_active FROM Servers WHERE id = ?`
        return myDB.fetchFirst(getDDoiky, [serverID]).then(value => {
            if (value.length == 0) return null;
            return value[0].ddoiky_active != 0;
        })
    },
    createServer(serverID, mainChannelID){
        const createServerSQL = `
            INSERT INTO Servers (id, ddoiky_active, main_channel)
                VALUES (?, ?, ?)`;
        return myDB.executesql(createServerSQL, [serverID, false, mainChannelID]);
    },
    createChannel(serverID, channelID, name){
        const createChannelSQL = `
            INSERT INTO Channels (id, server_id, name, streak, high_streak, draw_counter, is_alive)
                VALUES (?, ?, ?, 0, 0, 0, 0)
        `
        return myDB.executesql(createChannelSQL, [channelID, serverID, name])
    },
    updateServerMainChannel(serverID, mainChannelID){
        const updateSQL = `
            UPDATE Servers
                SET main_channel = ?
                WHERE id = ?`;
        return myDB.executesql(updateSQL, [mainChannelID, serverID]);
    },
    serverExists(serverID){
        const selectionSQL = `
            SELECT EXISTS (
                SELECT 1
                FROM Servers
                WHERE id = ?) as tmp`
        return myDB.fetchFirst(selectionSQL, [serverID]).then(v => {
            return v[0].tmp == 1;
        });
    },
    channelExists(channelID){
        const selectionSQL = `
            SELECT EXISTS (
                SELECT 1
                FROM Channels
                WHERE id = ?) as tmp`
        return myDB.fetchFirst(selectionSQL, [channelID]).then(v => {
            return v[0].tmp == 1;
        });
    },
    canMakeChannel(serverID, channelID, name){
        const eval = `
        SELECT EXISTS ( 
            SELECT 1 
            FROM Channels 
            WHERE id = ? 
            OR (name = ? AND server_id = ?)) as tmp`;
        return myDB.fetchFirst(eval, [channelID, name, serverID]).then(v => v[0].tmp == 0 && this.serverExists(serverID));
    },
    getAllServerChannels(serverID){
        const query = `
        SELECT * FROM Channels
            WHERE server_id = ?`
        return myDB.fetchAll(query, [serverID]);
    },
    getServerData(serverID){
        const query = `
        SELECT * FROM Servers
            WHERE id = ?`
        return myDB.fetchAll(query, [serverID]);
    },
    getAllServerData(serverID){
        const streaksDataPromise = this.getAllServerChannels(serverID);
        const serverDataPromise = this.getServerData(serverID);
        return Promise.all([streaksDataPromise, serverDataPromise]).then(([streaksData, serverData]) => {
            serverData.push({});
            return {
                server: serverData[0],
                streaks: streaksData
            };
        });
    },
    getStreakName(channelID){
        const query = `
        SELECT name FROM Channels
        WHERE id = ?`;
        return myDB.fetchFirst(query, channelID).then(value => {
            value.push({name: null})
            return value[0].name;
        });
    },
    deleteServer(serverID){
        const querys = `DELETE FROM Servers WHERE id = ?`;
        const queryc = `DELETE FROM Channels WHERE server_id = ?`;

        return Promise.all([myDB.executesql(querys, [serverID]), myDB.executesql(queryc, [serverID])]);
    },
    deleteStreak(channelID){
        const queryc = `DELETE FROM Channels WHERE id = ?`;
        return myDB.executesql(queryc, [channelID]);
    },
    setStreak(channelID, streak){
        const com = `
        UPDATE Channels
        SET streak = ?, 
            high_streak = MAX(high_streak, ?)
        WHERE id = ?`
        return myDB.executesql(com, [streak, streak, channelID]);
    },
    incrementStreakAndDrawCounter(channelID){
        const com = `
        UPDATE Channels
        SET draw_counter = draw_counter + 1,
            streak = streak + 1, 
            high_streak = MAX(high_streak, streak + 1)
        WHERE id = ?`;
        return myDB.executesql(com, [channelID]);
    },
    getDrawCounter(channelID){
        const query = `
        SELECT draw_counter, streak 
        FROM Channels
        WHERE id = ?`;  
        return myDB.fetchFirst(query, [channelID]).then(res => res[0] ? {counter: res[0].draw_counter, streak: res[0].streak} : null);
    },
    getAllServers(){
        const query = `
        SELECT *
        FROM Servers`;
        return myDB.fetchAll(query);
    },
    updateChannel(channel){
        const query = `
        UPDATE Channels
        SET
            streak = ?
            draw_counter = ?
            is_alive = ?
        WHERE id = ?`
        return myDB.executesql(query, [channel.streak, channel.draw_counter, channel.is_alive, channel.id]);
    }
}