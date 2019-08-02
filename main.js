const { app, BrowserWindow, shell, Menu } = require("electron")
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

app.on('ready', function () {
    const app_menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(app_menu) // 设置菜单部分
    createWindow()
})

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

/**
 * 注册键盘快捷键
 * 其中：label: '切换开发者工具',这个可以在发布时注释掉
 */
let template = [
    {
        label: 'Edit ( 操作 )',
        submenu: [{
            label: 'Copy ( 复制 )',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label: 'Paste ( 粘贴 )',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }, {
            label: 'Reload ( 重新加载 )',
            accelerator: 'CmdOrCtrl+R',
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    // on reload, start fresh and close any old
                    // open secondary windows
                    if (focusedWindow.id === 1) {
                        BrowserWindow.getAllWindows().forEach(function (win) {
                            if (win.id > 1) {
                                win.close()
                            }
                        })
                    }
                    focusedWindow.reload()
                }
            }
        }]
    },
    {
        label: 'Window ( 窗口 )',
        role: 'window',
        submenu: [{
            label: 'Minimize ( 最小化 )',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        }, {
            label: 'Close ( 关闭 )',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        }, {
            label: '切换开发者工具',
            accelerator: (function () {
                if (process.platform === 'darwin') {
                    return 'Alt+Command+I'
                } else {
                    return 'Ctrl+Shift+I'
                }
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            }
        }, {
            type: 'separator'
        }]
    },
    {
        label: 'Help ( 帮助 ) ',
        role: 'help',
        submenu: [{
            label: 'FeedBack ( 意见反馈 )',
            click: function () {
                electron.shell.openExternal('https://forum.iptchain.net')
            }
        },{
            label: 'Check Updates...',
            click: function(item, focusedWindow) {
                require('./updater').checkForUpdates(item, focusedWindow)
            }
        }]
    }
]

/**
 * 增加更新相关的菜单选项
 */
function addUpdateMenuItems(items, position) {
    if (process.mas) return

    const version = app.getVersion()
    let updateItems = [{
        label: `Version ${version}`,
        enabled: false
    }, {
        label: 'Checking for Update',
        enabled: false,
        key: 'checkingForUpdate'
    }, {
        label: 'Check for Update',
        visible: true,
        key: 'checkForUpdate',
        click: function () {
            require('electron').autoUpdater.checkForUpdates()
        }
    }, {
        label: 'Restart and Install Update',
        enabled: true,
        visible: false,
        key: 'restartToUpdate',
        click: function () {
            require('electron').autoUpdater.quitAndInstall()
        }
    }]

    items.splice.apply(items, [position, 0].concat(updateItems))
}

function findReopenMenuItem() {
    const menu = Menu.getApplicationMenu()
    if (!menu) return

    let reopenMenuItem
    menu.items.forEach(function (item) {
        if (item.submenu) {
            item.submenu.items.forEach(function (item) {
                if (item.key === 'reopenMenuItem') {
                    reopenMenuItem = item
                }
            })
        }
    })
    return reopenMenuItem
}

// 针对Mac端的一些配置
if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
        label: name,
        submenu: [{
            label: 'Quit ( 退出 )',
            accelerator: 'Command+Q',
            click: function () {
                app.quit()
            }
        }]
    })

    // Window menu.
    template[3].submenu.push({
        type: 'separator'
    }, {
            label: 'Bring All to Front',
            role: 'front'
        })

    // addUpdateMenuItems(template[0].submenu, 1)
}

// 针对Windows端的一些配置
if (process.platform === 'win32') {
    const helpMenu = template[template.length - 1].submenu
    // addUpdateMenuItems(helpMenu, 0)
}
