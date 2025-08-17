const { exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3');

/** @type {sqlite3.Database} */
var db;

const execute = async (db, sql, params = []) => {
    if (params && params.length > 0){
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

const fetchAll = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

const fetchFirst = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

/**
 *  |----------------------------------|
 *  | Servers                          |
 *  |----------------------------------|
 *  | id            |   VARCHAR(20)    |
 *  | ddoiky_active |   BOOL           |
 *  | main_channel  |   VARCHAR(20)    |
 *  | stats_message |   VARCHAR(20)    |
 *  |----------------------------------|
 *                                      
 *  |----------------------------------|
 *  | Channels                         |
 *  |----------------------------------|
 *  | id            |   VARCHAR(20)    |
 *  | server_id     |   VARCHAR(20)    |
 *  | name          |   VARCHAR(255)   |
 *  | streak        |   INTEGER        |
 *  | high_streak   |   INTEGER        |
 *  | last_message  |   DATETIME       |
 *  | is_alive      |   BOOL           |
 *  |----------------------------------|
**/

module.exports = {
    createConnection(){     // creates connection and tables if they do not exist :))
        db = new sqlite3.Database('./data/data.db');
        const create_servers_table = `
        CREATE TABLE IF NOT EXISTS Servers (
            id VARCHAR(20) PRIMARY KEY,
            ddoiky_active BOOL,
            main_channel VARCHAR(20),
            stats_message VARCHAR(20)
        );`

        const create_channels_table = `
        CREATE TABLE IF NOT EXISTS Channels (
            id VARCHAR(20) PRIMARY KEY,
            server_id VARCHAR(20) NOT NULL,
            name VARCHAR(255),
            streak INTEGER,
            high_streak INTEGER
            last_message DATETIME,
            is_alive BOOL,
            FOREIGN KEY(server_id) REFERENCES Servers(id)
        );`

        try {
            execute(db, create_servers_table);
        } catch (e){
            console.error(e);
        }
        try {
            execute(db, create_channels_table);
        } catch (e){
            console.error(e);
        }
        console.log('Successfully connected to DB')
    },
    closeConnection(){
        console.log('closing db connection');
        db.close();
    },
    executesql(sql, params = []){
        if (!db) console.error('Connection to Database not opened, please open a connection first!');
        return execute(db, sql, params);
    },
    fetchAll(sql, params){
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },
    fetchFirst(sql, params){
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }


}