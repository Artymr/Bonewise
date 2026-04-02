const mongoose = require('mongoose');

const FracturaSchema = new mongoose.Schema({
  fractura_loc: String,
  fractura_edad: Number,
  fractura_num: Number
});

const PacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: String,
  edad: Number,
  sexo: String,
  peso: Number,
  talla: Number,
  imc: Number,
  fracturas: [FracturaSchema],
  menopausia: Number,
  caidas: String,
  osteo_sec: String,
  enf_asoc: String,
  fx_cadera_fam: String,
  fx_osteo_fam: String,
  tabaquismo: String,
  alcohol: String,
  actividad: String,
  corticoides: String,
  artritis: String,
  otros: String,
  calcio_vitamina_d: String,
  bifosfonatos: String,
  denosumab: String,
  anabolicos: String,
  t_lumbar: Number,
  t_cuello: Number,
  zscore: Number,
  analitica: String,
  radiologia: String,
  riesgo_frax: Number,
  riesgo_dmo: String,
  plan: String,
  primerRegistro: { type: Date, default: Date.now },
  ultimaActualizacion: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Paciente', PacienteSchema);
