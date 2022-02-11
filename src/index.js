const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

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

    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync(path.join(__dirname, "..", "Addons", "Commands")).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, "..", "Addons", "Commands", file));
        client.commands.set(command.data.name, command)
    }

    const eventFiles = fs.readdirSync(path.join(__dirname, "..", "Addons", "Events")).filter(file => file.endsWith('.js'))

    for (const file of eventFiles) {
        const event = require(path.join(__dirname, "..", "Addons", "Events", file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    client.login(token).catch(err => {
        mainWindow.webContents.send('main:account:login:fail');
        if (err) return;
    });

    client.once('ready', () => {
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

if (client) {
    client.on('messageCreate', async message => {
        const args = message.content.slice(/*prefix.length*/).split(' ');
        const command = args.shift().toLowerCase();

	    if (!command) return;

	    try {
	    	await command.execute(message, args);
	    } catch (error) {
	    	console.error(error);
	        await message.reply({ content: 'There was an error while executing this command!'});
	    }
    })
}

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

    if (secondaryWindow) secondaryWindow.destroy();

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

let interval;
let activityObj = {};

ipcMain.on('secondary:account:set:activity', (e, activity) => {
    if (Object.keys(activity.name).length === 1) {
        client.user.setActivity({type: activity.type.activityA, name: activity.name.activityA});
        activityObj = {
            type: client.user.presence.activities[0].type,
            name: client.user.presence.activities[0].name
        };
        mainWindow.webContents.send('main:account:send:activity', activityObj);
        return;
    };
    var i = -1;
    clearInterval(interval);
    interval = setInterval(() => {
        i = i + 1;
        if (i == Object.keys(activity.name).length) return i = -1
        if (i == 0) client.user.setActivity({type: activity.type.activityA, name: `${activity.name.activityA}`});
        if (i == 1) client.user.setActivity({type: activity.type.activityB, name: `${activity.name.activityB}`});
        if (i == 2) client.user.setActivity({type: activity.type.activityC, name: `${activity.name.activityC}`});
        if (i == 3) client.user.setActivity({type: activity.type.activityD, name: `${activity.name.activityD}`});
        activityObj = {
            type: client.user.presence.activities[0].type,
            name: client.user.presence.activities[0].name
        };
        mainWindow.webContents.send('main:account:send:activity', activityObj);
    }, (activity.loopTime * 1000));
});

ipcMain.on('page:open:plugins', () => {
    if (secondaryWindow) secondaryWindow.destroy();

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
        pathname: path.join(__dirname, 'pages/plugins.html'),
        protocol: 'file:',
        slashes: true,
    }));
})

ipcMain.on('secondary:account:request:basicClientInfo:plugins', () => {
    secondaryWindow.webContents.send('secondary:account:send:basicClientInfo:plugins', client.commands.size)
})