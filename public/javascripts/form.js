// ======= scripts específicos del formulario =======

// Cálculo automático del IMC (índice de masa corporal)
const pesoEl = document.getElementById('peso');
const tallaEl = document.getElementById('talla');
const imcEl = document.getElementById('imc');

function calcIMC(){
  const p = parseFloat(pesoEl.value);
  const t = parseFloat(tallaEl.value);
  if(p>0 && t>0){
    const m = p / Math.pow(t/100,2);
    imcEl.value = m.toFixed(2);
  } else imcEl.value = '';
}
pesoEl?.addEventListener('input', calcIMC);
tallaEl?.addEventListener('input', calcIMC);

//validacion en el formulario
function validarNombre(nombre) {
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/;
  return pattern.test(nombre.trim());
}

function validarApellidos(apellidos) {
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+)+$/;
  return pattern.test(apellidos.trim());
}


//validar mientras se escribe
const nombreInput = document.getElementById('nombre');
const apellidosInput = document.getElementById('apellidos');

nombreInput?.addEventListener('blur', () => {
  if (nombreInput.value.trim() && !validarNombre(nombreInput.value)) {
    nombreInput.classList.add('is-invalid');
  } else {
    nombreInput.classList.remove('is-invalid');
  }
});

apellidosInput?.addEventListener('blur', () => {
  if (apellidosInput.value.trim() && !validarApellidos(apellidosInput.value)) {
    apellidosInput.classList.add('is-invalid');
  } else {
    apellidosInput.classList.remove('is-invalid');
  }
});

// ======= T-SCORE sliders =======
// Esta función servirá para cualquier slider en cualquier parte del DOM
function updateTScoreText(slider) {
  const container = slider.closest('.col-md-4, .form-group, .mb-3');
  const valueSpan = container?.querySelector('.t-score-val');
  if (valueSpan) {
    valueSpan.textContent = slider.value;
  }
}

// Escuchar cambios manuales del usuario
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('t-score')) {
    updateTScoreText(e.target);
    calcularRiesgoDMO(); // Recalcular riesgo DMO al cambiar cualquier T-score
  }
});

// Sincronización inicial para el formulario de "Nuevo Paciente"
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.t-score').forEach(s => updateTScoreText(s));
  calcularRiesgoDMO(); // Calcular riesgo DMO al cargar la página
});

// ======= Cálculo FRAX aproximado mejorado (para España) =======
function calcFraxMejorado() {
  const edad = Number(document.getElementById('edad')?.value) || 0;
  const sexo = document.getElementById('sexo')?.value === 'Femenino'; // true si femenino
  const peso = Number(document.getElementById('peso')?.value) || 0;
  const talla = Number(document.getElementById('talla')?.value) || 0;
  const tCuello = Number(document.getElementById('t_cuello')?.value) || null;

  if (!edad || peso <= 0 || talla <= 0) {
    document.getElementById('riesgo_frax').value = '';
    return;
  }

  const imc = peso / Math.pow(talla / 100, 2);

  // 1. Base + edad + sexo (aprox FRAX España mujer 50a ~ -3.0 logit)
  let logit = -4.0 + 0.058 * Math.max(0, edad - 50) + (sexo ? 0.42 : 0);

  // 2. Factores de riesgo (betas FRAX approx)
  const fracturas = document.getElementById('fract_previa')?.value || '';
  if (fracturas && fracturas !== 'no') logit += 1.0;
  if (getCheckbox('fx_cadera_fam')) logit += 0.5; 
  if (getCheckbox('tabaquismo')) logit += 0.3; 
  if (getCheckbox('alcohol')) logit += 0.3;        
  if (getCheckbox('corticoides')) logit += 0.6; 
  if (getCheckbox('artritis')) logit += 0.7;     
  if (getCheckbox('osteo_sec')) logit += 0.5;  

  // 3. IMC continuo (penaliza bajo)
  logit += Math.max(-0.1 * (25 - imc), 0);  // + si IMC <25

  // 4. T-score continuo (clave: gradual!)
  if (!isNaN(tCuello)) {
    logit += 0.45 * (-tCuello);  // ~doble riesgo por SD
  }

  // 5. Probabilidad 10a (sin muerte, approx)
  const risk = 100 / (1 + Math.exp(-logit));
  const porcentaje = Math.min(risk.toFixed(1), 30.0);  // Cap realista

  document.getElementById('riesgo_frax').value = porcentaje;
}

// Helper para checkboxes (adapta IDs)
function getCheckbox(id) {
  return document.getElementById(id)?.checked || false;
}

//calcular riesgo dmo
function calcularRiesgoDMO() {
  const tLumbar = parseFloat(document.getElementById('t_lumbar')?.value);
  const tCuello = parseFloat(document.getElementById('t_cuello')?.value);
  const riesgoInput = document.getElementById('riesgo_dmo');

  if (isNaN(tLumbar) || isNaN(tCuello)) {
    riesgoInput.value = '';
    return;
  }

  const peor = Math.min(tLumbar, tCuello);
  let riesgo = '';
  if (peor >= -1) {
    riesgo = 'Bajo';
  } else if (peor >= -2.5) {
    riesgo = 'Moderado';
  } else if (peor >= -3.5) {
    riesgo = 'Alto';
  } else {
    riesgo = 'Muy alto';
  }
  riesgoInput.value = riesgo;
}

//logica de fracturas previas
const fractChecks = document.querySelectorAll('.fractura-check');
const fractNo = document.getElementById('fract_no');
const fracturasInput = document.getElementById('fract_previa');

fractChecks.forEach(chk => {
  chk.addEventListener('change', () => {
    if (chk === fractNo && chk.checked) {
      fractChecks.forEach(c => {
         if (c !== fractNo) c.checked = false;
         });
    } else if (chk !== fractNo && chk.checked) {
      fractNo.checked = false;
    }
    actualizarFracturas();
  });
});

function actualizarFracturas() {
  const seleccionadas = [];
  document.querySelectorAll('.fractura-check').forEach(chk => {
    if (chk.checked) {
      if (chk.value === 'otro') {
        const texto = document.getElementById('fract_otro_text').value.trim();
        seleccionadas.push(texto ? `Otro: ${texto}` : 'Otro');
      } else {
        seleccionadas.push(chk.value);
      }
    }
  });
  document.getElementById('fract_previa').value = seleccionadas.join(',');
}

//logica de enfermedades asociadas
const enfChecks = document.querySelectorAll('.enf_asoc-check');
const enfNo = document.getElementById('enf_no');
const enfermedadesInput = document.getElementById('enfermedades_asociadas');
enfChecks.forEach(chk => {
  chk.addEventListener('change', () => {
    if (chk === enfNo && chk.checked) {
      enfChecks.forEach(c => {
         if (c !== enfNo) c.checked = false;
         });
    } else if (chk !== enfNo && chk.checked) {
      enfNo.checked = false;
    }
    actualizarEnfermedades();
  });
});

function actualizarEnfermedades() {
  const seleccionadas = [];
  document.querySelectorAll('.enf_asoc-check').forEach(chk => {
    if (chk.checked) {
      if (chk.value === 'otro') {
        const texto = document.getElementById('enf_otro_text').value.trim();
        seleccionadas.push(texto ? `Otro: ${texto}` : 'Otro');
      } else {
        seleccionadas.push(chk.value);
      }
    }
  });
  document.getElementById('enfermedades_asociadas').value = seleccionadas.join(',');
}

// Mostrar campos de texto para "otro" en fracturas y enfermedades
const fractOtroCheck = document.getElementById('fract_otro');
const fractOtroText = document.getElementById('fract_otro_text');

fractOtroCheck?.addEventListener('change', () => {
  if (fractOtroCheck.checked) {
    fractOtroText.classList.remove('d-none');
  } else {
    fractOtroText.classList.add('d-none');
    fractOtroText.value = '';
  }
});

const enfOtroCheck = document.getElementById('enf_otro');
const enfOtroText = document.getElementById('enf_otro_text');

enfOtroCheck?.addEventListener('change', () => {
  if (enfOtroCheck.checked) {
    enfOtroText.classList.remove('d-none');
  } else {
    enfOtroText.classList.add('d-none');
    enfOtroText.value = '';
  }
});

fractOtroText?.addEventListener('input', actualizarFracturas);
enfOtroText?.addEventListener('input', actualizarEnfermedades);

// Eventos (mismo que antes, añade #previa etc.)
document.addEventListener('input', calcFraxMejorado);
document.addEventListener('change', calcFraxMejorado);
document.addEventListener('DOMContentLoaded', calcFraxMejorado);

