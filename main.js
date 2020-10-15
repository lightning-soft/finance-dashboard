"use strict";
exports.__esModule = true;
const electron_1 = require("electron");
const url = require("url");
const electron_log_1 = require("electron-log");
const path = require("path");
let mainWindow;
function createWindow() {
  // Create the browser window.
  mainWindow = new electron_1.BrowserWindow({
    height: 800,
    // webPreferences: {
    //   preload: path.join(__dirname, "preload.js"),
    //   nodeIntegration: false,
    //   contextIsolation: true,
    //   enableRemoteModule: false
    // },
    width: 1600,
    frame: false,
    alwaysOnTop: false,
    title: "AMS Trading Platform",
    type: "desktop",
    // vibrancy: 'ultra-dark',
    show: false
  });
  // mainWindow.setBackgroundColor('#15161d10');
  // mainWindow.blur();
  // mainWindow.focus();
  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, "../index.html"));
  // mainWindow.loadURL(
  //   url.format({
  //       pathname: path.join(__dirname, `dist/browser/index.html`),
  //       protocol: "file:",
  //       slashes: true
  // }));
  mainWindow.loadURL("https://demo:ZsfLXCUDDQY6ST39@modulus.resadsoft.com/platform/latest/");
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
  });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", function () {
  createWindow();
  electron_1.app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    electron_1.app.quit();
  }
});
electron_1.ipcMain.on("close", function () {
  if (process.platform !== "darwin") {
    electron_1.app.quit();
  }
});
electron_1.ipcMain.on("maximize-or-restore", function () {
  electron_log_1["default"].info("mainWindow.isMaximized:" + mainWindow.isMaximized);
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  }
  else {
    mainWindow.maximize();
  }
});
function callNotification(body) {
  // let iconAddress = path.join(__dirname, '/icon.png');
  var notif = {
    title: "DeltaView",
    body: body
  };
  new electron_1.Notification(notif).show();
}
electron_1.ipcMain.on("minimize", function () {
  mainWindow.minimize();
  callNotification("Test notification");
});
