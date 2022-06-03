// Discord Imports
const clientConstructor = require('./client');

const { app, ipcMain, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");

let mainWindow;

app.once('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '..', 'HTML', 'login.html'),
        protocol: "file:",
        slashes: true,
    }));

    mainWindow.on('close', () => {
        app.exit();
    });
});

ipcMain.on('mainWindow:minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('mainWindow:close', () => {
    mainWindow.close();
});

ipcMain.on("mainWindow:login", (e, data) => {
    let client
    try {
        client = new clientConstructor(data.token);
    } catch {
        console.error("Something went wrong...");
    };
    console.log(client);
})