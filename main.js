const { app, BrowserWindow, shell, Menu } = require("electron")
const { ipcMain } = require('electron')
const fs = require('fs')
const iconv = require('iconv-lite')
const { autoUpdater } = require("electron-updater");

let win
let version = app.getVersion()
let template = [{
    label: "帮助",
    submenu: [
        {
            label: `版本 v${version}`,
            enabled: false,
        },
        {
            type: 'separator'
        },
        {
            label: '开发者工具',
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            }
        },
        {
            label: '更新升级',
            click: function () {
                autoUpdater.checkForUpdatesAndNotify()
            }
        }
    ]
}]

let filename
if (process.platform === 'win32') {
    filename = process.cwd() + '\\接单.csv'
} else if (process.platform === 'darwin') {
    filename = process.cwd() + '/接单.csv'
    const name = app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() { app.quit(); }
            },
        ]
    })
} else {
    filename = process.cwd() + '/接单.csv'
}

function sendStatusToWindow(text) {
    win.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
});

function createWindow() {
    win = new BrowserWindow({
        width: 815,
        height: 550,
        // resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')

    // win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', function () {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    createWindow();
});

app.on('ready', function () {
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('active', () => {
    if (win === null) {
        createWindow()
    }
});

ipcMain.on('save', (event, arg) => {
    sendStatusToWindow(arg)
    let data = ""
    for (let i = 0; i < arg.length; i++) {
        if (i === arg.length - 1) {
            data += arg[i]
            break
        }
        data = data + arg[i] + ','
    }
    data += '\n'
    let encodedData = iconv.encode(data, 'gbk');
    fs.appendFile(filename, encodedData, function (err) {
        if (err) {
            sendStatusToWindow('save fail')
            event.reply('saveResult', false)
        } else {
            sendStatusToWindow('save success')
            event.reply('saveResult', true)
        }
    })
})

ipcMain.on('openDb', (event) => {
    shell.showItemInFolder(filename)
})
