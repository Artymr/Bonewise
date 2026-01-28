var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render("inicio");
});

//nuevo paciente
router.get('/nuevo', function(req, res) {
  res.render("nuevo");
});

//buscar pacientes
router.get('/buscar', function(req, res) {
  res.render("buscar");
});

module.exports = router;
