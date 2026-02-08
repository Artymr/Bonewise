const mongoose = require('mongoose');

const FracturaSchema = new mongoose.Schema({
  fractura_loc: String,
  fractura_edad: Number,
  fractura_num: Number
});

const PacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  edad: Number,
  sexo: String,
  peso: Number,
  talla: Number,
  imc: Number,
  fracturas: [FracturaSchema],
  menopausia: Number,
  caidas: String,
  enf_asoc: String,
  cirugias: String,
  fx_cadera_fam: String,
  fx_osteo_fam: String,
  tabaquismo: String,
  alcohol: String,
  actividad: String,
  dieta: String,
  corticoides: String,
  farmacos: String,
  trat_actual: String,
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
