const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// ruta nueva (AppData)
const dbDir = path.join(app.getPath('userData'), 'datos');
const dbPath = path.join(dbDir, 'pacientes.db');

// ruta antigua (dentro del proyecto empaquetado)
const defaultDbPath = path.join(__dirname, '..', 'datos', 'pacientes.db');

// asegurar carpeta destino
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// MIGRACIÓN AUTOMÁTICA
if (!fs.existsSync(dbPath)) {
  try {
    if (fs.existsSync(defaultDbPath)) {
      fs.copyFileSync(defaultDbPath, dbPath);
      console.log('DB inicial copiada desde plantilla');
    } else {
      console.log('No hay DB inicial, se crea vacía');
    }
  } catch (err) {
    console.error('Error copiando DB inicial:', err);
  }
}

const db = new Datastore({
  filename: dbPath,
  autoload: true
});

module.exports = db;