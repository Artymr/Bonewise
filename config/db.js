const Datastore = require('@seald-io/nedb');
const path = require('path');

const db = new Datastore({
  filename: path.join(__dirname, '..', 'datos', 'pacientes.db'),
  autoload: true
});

module.exports = db;
