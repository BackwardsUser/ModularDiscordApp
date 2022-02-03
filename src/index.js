const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

const Discord = require('discord.js');
const client = new Discord.Client({
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

let mainWindow;

app.on('ready', () => {
    console.clear();
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,
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
    mainWindow.destroy()
})

ipcMain.on('login', (e, token) => {
    client.login(token).catch(err => {
        mainWindow.webContents.send('login:fail')
        if (err) throw err;
    });
});

client.on('ready', () => {
    console.log(`logged in as ${client.user.tag}`);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/main.html'),
        protocol: 'file:',
        slashes: true,
    }));

    const basicClientData = {
        "avatarURL" : client.user.avatarURL(),
        "tag" : client.user.tag
    }

    setTimeout( () => {
        mainWindow.webContents.send('login:success', basicClientData);
    }, 500);
});