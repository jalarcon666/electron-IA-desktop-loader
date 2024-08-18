const { app, Tray, Menu, shell, BrowserWindow, globalShortcut, screen, systemPreferences} = require('electron');
const { generateColorScript } = require('./generateColor.js');

const path = require('path');
const {generateColor} = require("./generateColor");

let tray;
let win;
let icon = path.join(__dirname, 'icon/chatgpt-icon-mac.png');
const accentColor = systemPreferences.getAccentColor().substring(0, 6);
const backgroundColorAccent = generateColor(`#${accentColor}`, 0.2);

const isAlreadyRunning = app.requestSingleInstanceLock();

if (isAlreadyRunning) {
    app.on('second-instance', app.quit);
}

const createWindow = () => {
    const display = screen.getPrimaryDisplay();

    let width = display.bounds.width;
    let height = display.bounds.height;

    win = new BrowserWindow({
        width: 430,
        height: 800,
        show: false,
        frame: false,
        skipTaskbar: true,
        showInBackground: true,
        x: width - 440,
        y: height -860,
        icon: icon,
        maximizable: false,
        resizable: false,
        fullscreenable: false,
        webPreferences: {
            devTools: false
        }
    });

    //win.loadURL('https://gemini.google.com/app');
    win.loadURL('https://chatgpt.com/');

    win.on('blur', win.hide);
};

app.whenReady().then(() => {
    tray = new Tray(icon);
    if (app.dock) app.dock.hide(); //Oculta icono en DOCK
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Salir de Gemini', type: 'normal', click: () => {
                win.close();
            }}
    ])
    tray.setContextMenu(contextMenu);
    tray.on('click', (event) => {
        win.show();
    })

    createWindow();

    globalShortcut.register('Command+g', () => {
        if (win.isVisible()) win.hide();
        else win.show();
    })
});