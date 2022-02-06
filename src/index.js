const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

const Discord = require('discord.js');

let client;

let mainWindow;
let secondaryWindow;

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
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/login.html'),
        protocol: 'file:',
        slashes: true,
    }));

    mainWindow.on('closed', () => {
        app.quit();
    });
});

ipcMain.on('main:close', () => {
    if (client) client.destroy();
    mainWindow.destroy();
});

ipcMain.on('secondary:close', () => {
    secondaryWindow.destroy();
});

ipcMain.on('main:account:login', (e, token) => {

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
        mainWindow.webContents.send('main:account:login:fail');
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
        };
    });
});

ipcMain.on('main:account:request:basicClientInfo', () => {
    mainWindow.webContents.send('main:account:send:clientBasicInfo', basicClientData);
});

ipcMain.on('secondary:account:request:basicClientInfo', () => {
    secondaryWindow.webContents.send('secondary:account:send:clientBasicInfo', basicClientData);
});

ipcMain.on('main:account:logout', () => {
    client.destroy();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/login.html'),
        protocol: 'file:',
        slashes: true,
    }));
});

ipcMain.on('main:account:status:changed', (e, updatedStatus) => {
    client.user.setStatus(updatedStatus);
});

ipcMain.on('page:open:activity', () => {

    secondaryWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    secondaryWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/activity.html'),
        protocol: 'file:',
        slashes: true,
    }));
});

ipcMain.on('main:account:require:activity', () => {
    mainWindow.webContents.send('main:account:send:activity', client.user.presence.activities);
});

let interval
let activityObj = {}

ipcMain.on('secondary:account:set:activity', (e, activity) => {
    if (Object.keys(activity.name).length === 1) {
        client.user.setActivity({type: activity.type.activityA, name: activity.name.activityA});
        activityObj = {
            type: client.user.presence.activities[0].type,
            name: client.user.presence.activities[0].name
        }
        mainWindow.webContents.send('main:account:send:activity', activityObj)
        return;
    };
    var i = -1;
    clearInterval(interval);
    interval = setInterval(() => {
        i = i + 1;
        if (i == Object.keys(activity.name).length) return i = -1
        if (i == 0) client.user.setActivity({type: activity.type.activityA, name: `${activity.name.activityA}`})
        if (i == 1) client.user.setActivity({type: activity.type.activityB, name: `${activity.name.activityB}`})
        if (i == 2) client.user.setActivity({type: activity.type.activityC, name: `${activity.name.activityC}`})
        if (i == 3) client.user.setActivity({type: activity.type.activityD, name: `${activity.name.activityD}`})
        activityObj = {
            type: client.user.presence.activities[0].type,
            name: client.user.presence.activities[0].name
        }
        mainWindow.webContents.send('main:account:send:activity', activityObj)
    }, (activity.loopTime * 1000))
})