// npm Packages
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const Discord = require('discord.js');
const console = require('console');

// Node Packages
const url = require('url');
const path = require('path');
const fs = require('fs');

// Electron Stuff
let mainWindow;
let secondaryWindow;

// Bot Stuff
let client;
let basicClientData = {};
let eventsObject = {};
let prefix;

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

ipcMain.on('saved.bot.data.request', () => {
    mainWindow.once('ready-to-show', () => {
        fs.readFile(path.join(__dirname, 'savedBots.json'), 'utf-8', function (err, data){
            const obj = JSON.parse(data);
            if (Object.keys(obj).length > 5) {
                delete obj[Object.keys(obj)[0]]
                fs.writeFileSync(path.join(__dirname, 'savedBots.json'), JSON.stringify(obj), 'utf-8', function (err) {
                    if (err) {
                        console.error(err)
                    };
                });
            };
            mainWindow.webContents.send('saved.bot.data.send', obj);
        });
    });
});

ipcMain.on('saved.bot.data.clear', () => {
    fs.readFile(path.join(__dirname, 'savedBots.json'), 'utf-8', function (err, data){
        const obj = JSON.parse(data);
        for (key in obj) {
            delete obj[key];
        };
        fs.writeFileSync(path.join(__dirname, 'savedBots.json'), JSON.stringify(obj), 'utf-8', function (err) {
            if (err) {
                console.error(err)
            };
        });
        mainWindow.reload();
    });
});

ipcMain.on('main:close', () => {
    if (client) client.destroy();
    mainWindow.destroy();
});

ipcMain.on('secondary:close', () => {
    secondaryWindow.destroy();
});

ipcMain.on('main:account:login', (e, loginArray) => {

    prefix = loginArray.prefix;
    const token = loginArray.token;

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

    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync(path.join(__dirname, "..", "Addons", "Commands")).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, "..", "Addons", "Commands", file));
        client.commands.set(command.data.Name, command);
    };

    const eventFiles = fs.readdirSync(path.join(__dirname, "..", "Addons", "Events")).filter(file => file.endsWith('.js'))

    for (const file of eventFiles) {
        const event = require(path.join(__dirname, "..", "Addons", "Events", file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        };

        eventsObject[event.name] = {
            description: event.description,
            author: event.author,
        };

    }

    client.once('ready', () => {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'pages/main.html'),
            protocol: 'file:',
            slashes: true,
        }));

        if (!loginArray.selector) {
            const clientName = client.user.username;
                fs.readFile(path.join(__dirname, 'savedBots.json'), 'utf-8', function readFileCallback(err, data) {
                    if (err) {
                        console.error(err);
                    } else {
                        obj = JSON.parse(data);
                        obj[clientName] = {
                            "TOKEN" : loginArray.token,
                            "PREFIX" : loginArray.prefix
                        }
                        fs.writeFileSync(path.join(__dirname, 'savedBots.json'), JSON.stringify(obj), 'utf-8', function (err) {
                            if (err) {
                                console.error(err)
                            }
                        })
                    }
                })
        };

        basicClientData = {
            "avatarURL": client.user.avatarURL(),
            "name": client.user.username,
            "serverCount": client.guilds.cache.size,
            "prefix": prefix
        };
    });
    
    client.on('messageCreate', async message => {
        const args = message.content.slice(prefix.length).split(' ');
        const command = args.shift().toLowerCase();

        const cmd = client.commands.get(command);

        if (!cmd || message.author.bot || !message.content.startsWith(prefix)) return;

        try {
            await cmd.execute(client, message, args);
        } catch (error) {
            console.error(error);
            await message.reply({ content: 'There was an error while executing this command!' });
        }
    })

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
        client.user.setActivity({ type: activity.type.activityA, name: activity.name.activityA });
        activityObj = {
            type: client.user.presence.activities[0].type,
            name: client.user.presence.activities[0].name,
            enabled: true
        };
        mainWindow.webContents.send('main:account:send:activity', activityObj);
        return;
    };
    var i = -1;
    clearInterval(interval);
    interval = setInterval(() => {
        i = i + 1;
        if (i == Object.keys(activity.name).length) return i = -1
        if (i == 0) client.user.setActivity({ type: activity.type.activityA, name: `${activity.name.activityA}` });
        if (i == 1) client.user.setActivity({ type: activity.type.activityB, name: `${activity.name.activityB}` });
        if (i == 2) client.user.setActivity({ type: activity.type.activityC, name: `${activity.name.activityC}` });
        if (i == 3) client.user.setActivity({ type: activity.type.activityD, name: `${activity.name.activityD}` });
        activityObj = {
            type: client.user.presence.activities[0].type,
            name: client.user.presence.activities[0].name,
            enabled: true
        };
        mainWindow.webContents.send('main:account:send:activity', activityObj);
    }, (activity.loopTime * 1000));
});

ipcMain.on('secondary:account:clear:activity', () => {
    clearInterval(interval);
    for (activity in activityObj) {
        delete activityObj[activity];
    };
    client.user.setActivity()
    activityObj = {
        type: undefined,
        name: "No Activity Set. Set it with the button below!",
        enabled: false
    }
    mainWindow.webContents.send('main:account:send:activity', activityObj);
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
    const pluginsCountObj = {
        commandsCount: client.commands.size,
        eventsCount: Object.keys(eventsObject).length
    };
    secondaryWindow.webContents.send('secondary:account:send:basicClientInfo:plugins', pluginsCountObj)
})

ipcMain.on('secondary:page:open:commands', () => {
    secondaryWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/plugins/commands.html'),
        protocol: 'file:',
        slashes: true,
    }));
})

ipcMain.on('secondary:account:request:basicClientInfo:commands', () => {
    let commands = {}
    for (const command of client.commands) {

        const cmd = client.commands.get(command[0])

        commands[cmd.data.Name] = {
            Author: cmd.data.Author,
            Description: cmd.data.Description
        }
    }


    setTimeout(() => {
        secondaryWindow.webContents.send('secondary:account:send:basicClientInfo:commands', commands);
    }, 150)
});

ipcMain.on('page:open:prefixPopup', () => {
    if (secondaryWindow) secondaryWindow.destroy();
    secondaryWindow = new BrowserWindow({
        width: 500,
        height: 600,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    secondaryWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/popups/prefix.html'),
        protocol: 'file:',
        slashes: true,
    }));

});

ipcMain.on('basicClientData:update:prefix', (e, prefix) => {
    basicClientData.prefix = prefix;
    secondaryWindow.destroy();
    mainWindow.reload();
});

ipcMain.on('secondary:page:open:events', () => {
    secondaryWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/plugins/events.html'),
        protocol: 'file:',
        slashes: true,
    }));
});

ipcMain.on('secondary:account:request:basicClientInfo:events', () => {

    let eventsObject = {};

    const eventFiles = fs.readdirSync(path.join(__dirname, "..", "Addons", "Events")).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(__dirname, "..", "Addons", "Events", file));
        eventsObject[event.name] = {
            Author: event.author,
            Description: event.description,
        }
    };

    setTimeout(() => {
        secondaryWindow.webContents.send('secondary:account:send:basicClientInfo:events', eventsObject);
    }, 150);
});

ipcMain.on('secondary:window:open:plugins', () => {
    shell.openExternal(url.format({
        pathname: path.join(__dirname, '../Addons'),
        protocol: 'file:',
        slashes: true,
    }));
});

ipcMain.on('secondary:page:plugins:back', () => {
    secondaryWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/plugins.html'),
        protocol: 'file:',
        slashes: true,
    }));
});