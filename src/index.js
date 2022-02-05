const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

const Discord = require('discord.js');

let client;

let mainWindow;

let basicClientData = {};

app.on('ready', () => {
    console.clear();
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    console.log(path.join(__dirname, 'pages/login.html'))

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/login.html'),
        protocol: 'file:',
        slashes: true,
    }))

    mainWindow.on('closed', () => {
        app.quit();
    })
})

ipcMain.on('main:close', () => {
    if (client) client.destroy();
    mainWindow.destroy()
})

ipcMain.on('account:login', (e, token) => {

    client = new Discord.Client({
        intents: [
            "DIRECT_MESSAGES",
            "DIRECT_MESSAGE_REACTIONS",
            "DIRECT_MESSAGE_TYPING",
            "GUILDS",
            "GUILD_BANS",
            "GUILD_EMOJIS_AND_STICKERS",
            "GUILD_INTEGRATIONS",
            "GUILD_INVITES",
            "GUILD_MEMBERS",
            "GUILD_MESSAGES",
            "GUILD_MESSAGE_REACTIONS",
            "GUILD_MESSAGE_TYPING",
            "GUILD_PRESENCES",
            "GUILD_VOICE_STATES",
            "GUILD_WEBHOOKS",
        ],
    });

    client.login(token).catch(err => {
        mainWindow.webContents.send('account:login:fail')
        if (err) return;
    });

    client.on('ready', () => {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'pages/main.html'),
            protocol: 'file:',
            slashes: true,
        }));
    
        basicClientData = {
            "avatarURL" : client.user.avatarURL(),
            "name" : client.user.username,
            "serverCount" : client.guilds.cache.size
        }
    });

});

ipcMain.on('account:login:request:basicClientInfo', () => {
    mainWindow.webContents.send('account:login:send:clientBasicInfo', basicClientData)
})

ipcMain.on('account:logout', () => {
    client.destroy();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/login.html'),
        protocol: 'file:',
        slashes: true,
    }));
});

ipcMain.on('account:status:changed', (e, updatedStatus) => {
    console.log(client.user.presence);
    client.user.setStatus(updatedStatus);
    console.log(client.user.presence)
});