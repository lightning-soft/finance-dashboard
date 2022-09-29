const {ipcRenderer} = require('electron')
setTimeout(() => {
  let close = document.getElementById('native-close-button')
  let max = document.getElementById('native-maximize-button')
  let min = document.getElementById('native-minimize-button')

  close.onclick = ()=>ipcRenderer.send('close');
  max.onclick = ()=>ipcRenderer.send('maximize');
  min.onclick = ()=>ipcRenderer.send('minimize');

}, 5000)
