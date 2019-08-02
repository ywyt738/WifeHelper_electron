// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')
const moment = require('moment')

ipcRenderer.on('saveResult', (event, arg) => {
    if (arg) {
        alert("提交成功")
    } else {
        alert("保存失败")
    }
})

function getRadioValue(radioName) {
    let allRadio = document.getElementsByName(radioName)
    for (let i = 0; i < allRadio.length; i++) {
        if (allRadio[i].checked === true) {
            return allRadio[i].value
        }
    }
}

function getFormData() {
    let id = document.getElementById('id').value
    let contractDatetime = document.getElementById('contractDatetime').value
    let caseType = getRadioValue('caseType')
    let belongTeam = getRadioValue('belongTeam')
    let elements = [id, contractDatetime, caseType, belongTeam]
    return elements;
}

function save() {
    let formdata = getFormData()
    ipcRenderer.send('save', formdata)
    document.getElementById('form').reset()
}

function addNow() {
    timeInput = document.getElementById('contractDatetime')
    let now = moment().format('YYYY-MM-DD HH:mm')
    _t = timeInput.value
    timeInput.value = _t + ' ' + now
}

function openDb() {
    ipcRenderer.send('openDb')
}

document.getElementById("submit").addEventListener("click", save);
document.getElementById("addNow").addEventListener("click", addNow);
document.getElementById("openDb").addEventListener("click", openDb);
