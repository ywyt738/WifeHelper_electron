const { app, BrowserWindow } = require("electron")
const { ipcMain } = require('electron')
const fs = require('fs')
const iconv = require('iconv-lite')

function createWindow() {
    let win = new BrowserWindow({
        width: 815,
        height: 520,
        // resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')

    win.webContents.openDevTools()

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

ipcMain.on('save', (event, arg) => {
    let filename = __dirname + '/接单.csv'
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
