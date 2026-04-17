// main.js - punto de entrada de la aplicación Electron
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let serverStarted = false;

function startServer() {
  return new Promise((resolve, reject) => {
    if (serverStarted) return resolve();
    serverStarted = true;

    try {
      const server = require('./bin/www');

      // Si bin/www exporta el server http, esperamos el evento 'listening'
      if (server && server.on) {
        server.once('listening', () => {
          console.log('Servidor Express listo en puerto 3000');
          resolve();
        });
        server.once('error', (err) => {
          console.error('Error al iniciar el servidor:', err);
          reject(err);
        });
      } else {
        // Si no exporta nada, esperamos un momento
        setTimeout(resolve, 1000);
      }
    } catch (err) {
      console.error('Error al cargar bin/www:', err);
      reject(err);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'BoneWise',
    show: false, // no mostrar hasta que cargue
    webPreferences: {
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  // Mostrar la ventana cuando esté lista (evita pantalla en blanco)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Si falla la carga, mostrar igualmente para ver el error
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error cargando la URL:', errorCode, errorDescription);
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Evitar múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // Autoupdater solo en producción y con manejo de errores
    if (app.isPackaged) {
      try {
        const { autoUpdater } = require('electron-updater');
        autoUpdater.checkForUpdatesAndNotify();
      } catch (err) {
        console.warn('AutoUpdater no disponible:', err.message);
      }
    }

    try {
      await startServer();
    } catch (err) {
      console.error('No se pudo iniciar el servidor, abriendo ventana de todas formas:', err);
    }

    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}