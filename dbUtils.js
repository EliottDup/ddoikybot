const { Client } = require("discord.js");
const myDB = require("./myDB");

module.exports = {
    getServerMainChannel(serverID, /** @type {Client} **/ client){
        const getMainChannelQuery = `SELECT main_channel FROM Servers WHERE ID = ?`;

        return myDB.fetchFirst(getMainChannelQuery, [serverID]).then(value => {
            if (value.length == 0) return null;
            const id = value[0].MainChannel;
            return client.channels.fetch(id);
        });
    },
    getServerDDoikyActive(serverID){
        const getDDoiky = `SELECT ddoiky_active FROM Servers WHERE ID = ?`
        return myDB.fetchFirst(getDDoiky, [serverID]).then(value => {
            if (value.length == 0) return null;
            return value[0].DDoikyActive != 0;
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
        return myDB.executesql(createChannelSQL, channelID, serverID, name)
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
    canMakeChannel(serverID, channelID, name){
        const eval = `
        SELECT EXISTS ( 
            SELECT 1 
            FROM Channels 
            WHERE id = ? 
            OR (name = ? AND server_id = ?
        ) as tmp`;
        return myDB.fetchFirst(eval, [channelID, name, serverID]).then(v => v[0].tmp == 0);
    }
}