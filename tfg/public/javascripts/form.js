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

addFract?.addEventListener('click', ()=>{
  const loc = document.getElementById('fractura_loc').value.trim();
  const edad = document.getElementById('fractura_edad').value.trim();
  const num = document.getElementById('fractura_num').value.trim();
  if(!loc && !edad) return;

  const div = document.createElement('div');
  div.className = 'alert alert-secondary d-flex justify-content-between align-items-center py-1';
  div.innerHTML = `<div><strong>${loc}</strong>${edad?` — edad: ${edad}`:''}${num?` — n: ${num}`:''}</div><button type="button" class="btn-close" aria-label="Eliminar"></button>`;
  div.querySelector('.btn-close').addEventListener('click', ()=>div.remove());
  fracturasList.appendChild(div);
  
  document.getElementById('fractura_loc').value='';
  document.getElementById('fractura_edad').value='';
  document.getElementById('fractura_num').value='';
});

//validacion en el formulario
function validarNombre(nombre) {
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+){1,2}$/;
  return pattern.test(nombre.trim());
}

//validar mientras se escribe
const nombreInput = document.getElementById('nombre');
nombreInput?.addEventListener('blur', () => {
  if (nombreInput.value.trim() && !validarNombre(nombreInput.value)) {
    nombreInput.classList.add('is-invalid');
  } else {
    nombreInput.classList.remove('is-invalid');
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
  }
});

// Sincronización inicial para el formulario de "Nuevo Paciente"
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.t-score').forEach(s => updateTScoreText(s));
});
