/*
    Main app entrypoint.
    Do not modify unless you want to change initialization.
*/

const {app, BrowserWindow} = require('electron');
const url = require('url');

function boot() {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        minHeight: 1024,
        minWidth: 1024
    });
    win.loadURL(url.format({ //deprecated ¯\_(ツ)_/¯
        pathname: '../index.html',
        slashes: true
    }));
    win.removeMenu(); //optional, but reccomended
    win.maximize();
    win.webContents.openDevTools();
}

app.on('ready', boot);