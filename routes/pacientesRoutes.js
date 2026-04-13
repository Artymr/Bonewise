const express = require('express');
const router = express.Router();
const db = require('../config/db');  // NeDB, cambio de Mongoose

// Obtener todos los pacientes
router.get('/', (req, res) => {
  db.find({}, (err, docs) => {
    if (err) return res.status(500).json({ message: 'Error al obtener pacientes', error: err });
    res.json(docs);
  });
});

// Obtener un paciente por ID
router.get('/:id', (req, res) => {
  db.findOne({ _id: req.params.id }, (err, doc) => {
    if (err) return res.status(500).json({ message: 'Error al obtener paciente', error: err });
    if (!doc) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json(doc);
  });
});

// Crear un nuevo paciente
router.post('/', (req, res) => {
  const doc = {
    ...req.body,
    primerRegistro: new Date(),
    ultimaActualizacion: new Date()
  };
  db.insert(doc, (err, newDoc) => {
    if (err) return res.status(400).json({ message: 'Error al crear paciente', error: err });
    res.status(201).json(newDoc);
  });
});

// Actualizar un paciente por ID
router.put('/:id', (req, res) => {
  // Quitar _id del body para que NeDB no intente sobreescribirlo
  const { _id, ...resto } = req.body;
  const cambios = { ...resto, ultimaActualizacion: new Date() };

  db.update(
    { _id: req.params.id },
    { $set: cambios },
    {},
    (err, numReplaced) => {
      if (err) return res.status(400).json({ message: 'Error al actualizar paciente', error: err });
      if (numReplaced === 0) return res.status(404).json({ message: 'Paciente no encontrado' });
      db.findOne({ _id: req.params.id }, (err, doc) => res.json(doc));
    }
  );
});

// Eliminar un paciente por ID
router.delete('/:id', (req, res) => {
  db.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar paciente', error: err });
    if (numRemoved === 0) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json({ message: 'Paciente eliminado correctamente' });
  });
});

module.exports = router;