const { Client } = require("discord.js");
const myDB = require("./myDB");
const { GuildMessageManager } = require("discord.js");

module.exports = {
    getServerMainChannel(serverID, /** @type {Client} **/ client){
        const getMainChannelQuery = `SELECT main_channel FROM Servers WHERE id = ?`;

        return myDB.fetchFirst(getMainChannelQuery, [serverID]).then(value => {
            if (value.length == 0) return null;
            const id = value[0].main_channel;
            return client.channels.fetch(id);
        });
    },
    getServerStatMessage(serverID, /** @type {Client} **/ client){
        const query = `SELECT stats_message FROM Servers WHERE id = ?`;

        return myDB.fetchFirst(query, serverID).then(msg => {
            if (msg.length == 0) return null;
            return this.getServerMainChannel(serverID, client).then(channel => {
                if (channel == null) return null;
                /** @type {GuildMessageManager} */
                let messages = channel.messages;
                return messages.fetch(msg);
            })
        })
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
            INSERT INTO Channels (id, server_id, name, streak, high_streak, is_alive)
                VALUES (?, ?, ?, 0, 0, 0)
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
    getStreaksData(serverID){
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
        const streaksDataPromise = this.getStreaksData(serverID);
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

        myDB.executesql(querys, [serverID]);
        myDB.executesql(queryc, [serverID]);
    },
    deleteStreak(channelID){
        const queryc = `DELETE FROM Channels WHERE server_id = ?`;
        myDB.executesql(queryc, [channelID]);
    }
}