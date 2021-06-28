"use strict";
exports.__esModule = true;
const electron = require("electron");
const app = electron.app;
const dialog = electron.dialog;
const url = require("url");
const electron_log_1 = require("electron-log");
const path = require("path");
const {BrowserWindow} = electron;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');
let win;
app.showExitPrompt = true

// nativeTheme.on('updated', function theThemeHasChanged () {
//   updateMyAppTheme(nativeTheme.shouldUseDarkColors)
// })
function createWindow() {
  const size = electron.screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    frame: true,
    alwaysOnTop: false,
    title: "Tradrr",
    show: false,
    movable: true,
    webPreferences: {
      webSecurity: false
    }
    // webPreferences: {
    //   nodeIntegration: true,
    //   allowRunningInsecureContent: (serve) ? true : false,
    //   contextIsolation: false,  // false if you want to run 2e2 test with Spectron
    //   enableRemoteModule : true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    // },
  });


  if (serve) {

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/browser/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
  win.once('ready-to-show', function () {
    win.show();
  });
  // Emitted when the window is closed.
  win.on('close', (e) => {
    if (app.showExitPrompt) {
      e.preventDefault() // Prevents the window from closing
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Unsaved data will be lost. Are you sure you want to quit?'
      }).then(({response}) => {
          if (response === 0) { // Runs the following if 'Yes' is clicked
            app.showExitPrompt = false;
            win.close()
            // Dereference the window object, usually you would store window
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null;
          }
        }
      );
    }
  });

  return win;
  // mainWindow.once('focus', () => mainWindow.flashFrame(false))
  // mainWindow.flashFrame(true)
  // // mainWindow.setBackgroundColor('#15161d10');
  // // mainWindow.blur();
  // // mainWindow.focus();
  // // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, "/dist/browser/index.html"));
  // // mainWindow.loadURL(
  // //   url.format({
  // //     pathname: path.join(__dirname, '/dist/browser/index.html'),
  // //     protocol: "file:",
  // //     slashes: true
  // //   })).then();
  // // mainWindow.loadURL("https://demo:ZsfLXCUDDQY6ST39@modulus.resadsoft.com/platform/latest/");
  // // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  // mainWindow.once('ready-to-show', function () {
  //   mainWindow.show();
  // });
}


try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}


// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on("window-all-closed", function () {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
// electron.ipcMain.on("close", function () {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
// electron.ipcMain.on("maximize-or-restore", function () {
//   electron_log_1["default"].info("mainWindow.isMaximized:" + mainWindow.isMaximized);
//   if (mainWindow.isMaximized()) {
//     mainWindow.unmaximize();
//   } else {
//     mainWindow.maximize();
//   }
// });

// function callNotification(body) {
//   // let iconAddress = path.join(__dirname, '/icon.png');
//   var notif = {
//     title: "Tradrr",
//     body: body
//   };
//   new electron.Notificatπion(notif).show();
// }

// electron.ipcMain.on("minimize", function () {
//   mainWindow.minimize();
//   callNotification("Test notification");
// });

// const isMac = process.platform === 'darwin'

// const template = [
//   // { role: 'appMenu' }
//   ...(isMac ? [{
//     label: app.name,
//     submenu: [
//       { role: 'about' },
//       { type: 'separator' },
//       { role: 'services' },
//       { type: 'separator' },
//       { role: 'hide' },
//       { role: 'hideothers' },
//       { role: 'unhide' },
//       { type: 'separator' },
//       { role: 'quit' }
//     ]
//   }] : []),
//   // { role: 'fileMenu' }
//   {
//     label: 'File',
//     submenu: [
//       isMac ? { role: 'close' } : { role: 'quit' }
//     ]
//   },
//   // { role: 'editMenu' }
//   {
//     label: 'Edit',
//     submenu: [
//       { role: 'undo' },
//       { role: 'redo' },
//       { type: 'separator' },
//       { role: 'cut' },
//       { role: 'copy' },
//       { role: 'paste' },
//       ...(isMac ? [
//         { role: 'pasteAndMatchStyle' },
//         { role: 'delete' },
//         { role: 'selectAll' },
//         { type: 'separator' },
//         {
//           label: 'Speech',
//           submenu: [
//             { role: 'startspeaking' },
//             { role: 'stopspeaking' }
//           ]
//         }
//       ] : [
//           { role: 'delete' },
//           { type: 'separator' },
//           { role: 'selectAll' }
//         ])
//     ]
//   },
//   // { role: 'viewMenu' }
//   {
//     label: 'View',
//     submenu: [
//       { role: 'reload' },
//       { role: 'forcereload' },
//       { role: 'toggledevtools' },
//       { type: 'separator' },
//       { role: 'resetzoom' },
//       { role: 'zoomin' },
//       { role: 'zoomout' },
//       { type: 'separator' },
//       { role: 'togglefullscreen' }
//     ]
//   },
//   // { role: 'windowMenu' }
//   {
//     label: 'Window',
//     submenu: [
//       { role: 'minimize' },
//       { role: 'zoom' },
//       ...(isMac ? [
//         { type: 'separator' },
//         { role: 'front' },
//         { type: 'separator' },
//         { role: 'window' }
//       ] : [
//           { role: 'close' }
//         ])
//     ]
//   },
//   {
//     role: 'help',
//     submenu: [
//       {
//         label: 'Learn More',
//         click: async () => {
//           const { shell } = require('electron')
//           await shell.openExternal('https://electronjs.org')
//         }
//       }
//     ]
//   }
// ]
// const menu = Menu.buildFromTemplate(template)
// Menu.setApplicationMenu(null)
// app.on("ready", function () {
//   createWindow();
//   app.on("activate", function () {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (electron.BrowserWindow.getAllWindows().length === 0)
//       createWindow();
//   });
// });
