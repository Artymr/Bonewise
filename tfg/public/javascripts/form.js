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

// Añadir fractura (punto 2 del formulario )
const addFract = document.getElementById('addFract');
const fracturasList = document.getElementById('fracturasList');

addFract?.addEventListener('click', () => {
  const loc = document.getElementById('fractura_loc').value.trim();
  const edad = document.getElementById('fractura_edad').value.trim();
  const num = document.getElementById('fractura_num').value.trim();

  if (!loc && !edad) return;

  const div = document.createElement('div');
  div.className = 'alert alert-secondary d-flex justify-content-between align-items-center py-1';

  div.innerHTML = `
    <div>
      <strong>${loc}</strong>
      ${edad ? ` — edad: ${edad}` : ''}
      ${num ? ` — n: ${num}` : ''}
    </div>
    <button type="button" class="btn-close" aria-label="Eliminar"></button>
  `;

  // añadir a la lista
  fracturasList.appendChild(div);
  updateFracturaPrevia(); // ← AQUÍ

  // botón eliminar
  div.querySelector('.btn-close').addEventListener('click', () => {
    div.remove();
    updateFracturaPrevia(); // ← Y AQUÍ
  });

  // limpiar inputs
  document.getElementById('fractura_loc').value = '';
  document.getElementById('fractura_edad').value = '';
  document.getElementById('fractura_num').value = '';
});


// Valor si/no de fractura previa para el calculo de FRAX
function updateFracturaPrevia() {
  const hidden = document.getElementById('fractura_previa');
  hidden.value = fracturasList.children.length > 0 ? 'si' : 'no';
}

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
  if (getCheckbox('fract_previa')) logit += 1.0;
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
  if (peor >= -2) {
    riesgo = 'Bajo';
  } else if (peor >= -2.5) {
    riesgo = 'Moderado';
  } else if (peor >= -3) {
    riesgo = 'Alto';
  } else {
    riesgo = 'Muy alto';
  }
  riesgoInput.value = riesgo;
}


// Eventos (mismo que antes, añade #fract_previa etc.)
document.addEventListener('input', calcFraxMejorado);
document.addEventListener('change', calcFraxMejorado);
document.addEventListener('DOMContentLoaded', calcFraxMejorado);

