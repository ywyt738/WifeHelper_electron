// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')
const moment = require('moment')

ipcRenderer.on('message', function (event, text) {
    console.log(text)
})

ipcRenderer.on('alert', function (event, text) {
    alert(text)
})

ipcRenderer.on('updateProcess', function (event, percent) {
    document.getElementById("update_percent").textContent = "下载进度: " + percent + "%"
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
    let timeInput = document.getElementById('contractDatetime')
    timeInput.value.match(/(\d{4}[\/]\d{1,2})[\/](\d{1,2})/g)
    let month = RegExp.$1
    ipcRenderer.send('save', formdata, month)
    document.getElementById('form').reset()
}

function addNow() {
    timeInput = document.getElementById('contractDatetime')
    let now = moment().format('YYYY/M/D HH:mm')
    _t = timeInput.value
    _t = _t + ' ' + now
    timeInput.value = _t.replace(/^\s*|\s*$/g,"")
}

function openDb() {
    ipcRenderer.send('openDb')
}

document.getElementById("submit").addEventListener("click", save);
document.getElementById("addNow").addEventListener("click", addNow);
document.getElementById("openDb").addEventListener("click", openDb);
