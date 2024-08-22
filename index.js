const { app, Tray, Menu, shell, BrowserWindow, globalShortcut, screen, systemPreferences} = require('electron');
const { generateColorScript } = require('./generateColor.js');

const path = require('path');
const {generateColor} = require("./generateColor");

let tray;
let win;
let icon = path.join(__dirname, 'icon/google-gemini-icon.png');
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

    win.loadURL('https://gemini.google.com/app');

    Menu.setApplicationMenu(null)

    win.webContents.on('did-finish-load', () => {
        loadPreScript();
        win.show();
    });

    win.webContents.on('did-navigate', () => {
        loadPreScript();
    });

    win.on('blur', win.hide);
};

app.whenReady().then(() => {
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Salir de Gemini', type: 'normal', click: () => {
                win.close();
            }},
    ])
    tray.setContextMenu(contextMenu);
    tray.on('click', (event) => {
        win.show();
    })

    createWindow();

    globalShortcut.register('Ctrl+g', () => {
        if (win.isVisible()) win.hide();
        else win.show();
    })

    globalShortcut.register('Ctrl+Shift+g', () => {
        if (!win.isVisible()) win.show();
        win.webContents.executeJavaScript("document.querySelector('.speech_dictation_mic_button').click()");
    })
});

const preScript = `
    const darkMode = document.body.classList.contains('dark-theme');
    function a(a){
        return document.querySelector('.'+a);
    }
    const loginFrame = document.getElementsByClassName('gb_Ld')[0];
        const addedTextStyle = {
        fontFamily: 'Google Sans',
        fontSize: '15px',
        opacity: 0,
        transition: 'opacity 0.4s',
        pointerEvents: 'none'
    }
    const openWithText = document.createElement('span');
    openWithText.textContent = "Abrir Gemini con [Ctrl] + [G]";
    Object.assign(openWithText.style, addedTextStyle);
    setTimeout(() => {openWithText.style.opacity = 0.5;}, 600);
    const openMicText = document.createElement('span');
    openMicText.textContent = 'Activar micro con [Ctrl] + [Mayus] + [G]';
    Object.assign(openMicText.style, addedTextStyle);
    setTimeout(() => {openMicText.style.opacity = 0.5;},700);
    if (!loginFrame) {
        const gmatCaption = document.querySelector('.gmat-caption');
        const zeroStateWrapper = document.querySelector('.zero-state-wrapper');
        zeroStateWrapper.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
        zeroStateWrapper.append(openWithText, openMicText);
        gmatCaption.textContent = 'Cliente Gemini para Windows Juanjo';
        Object.assign(gmatCaption.style, {
            opacity: 0.5,
            pointerEvents: 'none'
        });
        const hello = document.querySelector('.bard-hello').textContent.split(' ');
        const greetings = ['Yeepa', 'hola'];
        hello[0] = greetings[Math.floor(Math.random() * greetings.length)];
        document.querySelector('.bard-hello').textContent = hello.join(' ');
        document.querySelector('.bard-hello').style.pointerEvents = 'none';
        document.querySelector('.bard-question').textContent = 'Como puedo ayudarte?';
        const style = document.createElement('style');
        style.textContent = 'body, .chat-container, .response-container, .chat-history, .mat-drawer, .mat-expansion-panel-header, .mat-expansion-panel-content  {background-color: ${backgroundColorAccent} !important} .bottom-container:before {background: linear-gradient(to top, ${backgroundColorAccent}, rgba(0, 0, 0, 0)) !important } .bottom-container, .mat-bottom-sheet-container, .bard-mode-bottom-sheet, .mat-mdc-dialog-surface {background: ${backgroundColorAccent} !important} .bard-question{pointer-events: none} .gmat-caption {pointer-events: none; !important} .text-input-field, .circular-background{background: none !important; backdrop-filter: brightness(0.7)}';
        document.head.appendChild(style);
        if (darkMode) {
        const darkModeStyle = document.createElement('style');
        darkModeStyle.textContent = '.bard-question {color: white !important; opacity: 0.4}'
        document.head.appendChild(darkModeStyle);
        }
    }`

function loadPreScript() {
    win.webContents.executeJavaScript(preScript);
}
