const { app, BrowserWindow, shell } = require("electron")
const { ipcMain } = require('electron')
const fs = require('fs')
const iconv = require('iconv-lite')

function createWindow() {
    let win = new BrowserWindow({
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

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('active', () => {
    if (win === null) {
        createWindow()
    }
})

var filename
if (process.platform === 'win32') {
    filename = process.cwd() + '\\接单.csv'
} else {
    filename = process.cwd() + '/接单.csv'
}
ipcMain.on('save', (event, arg) => {
    console.log(arg)
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
            console.log('save fail')
            event.reply('saveResult', false)
        } else {
            console.log('save success')
            event.reply('saveResult', true)
        }
    })
})

ipcMain.on('openDb', (event) => {
    shell.showItemInFolder(filename)
})
