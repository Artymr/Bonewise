// Cargar pacientes al inicio
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

// Calcular IMC (sin cambios)
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

// Añadir fractura dinámica (sin cambios)
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

// Elementos principales
const formContainer = document.getElementById('osteoform');
const buscarSection = document.getElementById('buscarPacientes');
const inicioSection = document.getElementById('inicio');
const menuButtons = document.querySelectorAll('.navbar-nav .nav-link');
const buscarLink = document.querySelector('a[href="#buscar"]');

// Inicializar vistas
formContainer.style.display = 'none';
buscarSection.style.display = 'none';
updateTable(); // Cargar tabla inicial

// Manejo de navegación (unificado, evita duplicados)
menuButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveButton(btn);
    if (btn.textContent.trim() === 'Inicio') {
      formContainer.style.display = 'none';
      buscarSection.style.display = 'none';
      inicioSection.style.display = 'block';
    } else if (btn.textContent.trim() === 'Nuevo paciente') {
      formContainer.style.display = 'block';
      buscarSection.style.display = 'none';
      inicioSection.style.display = 'none';
    } else if (btn.textContent.trim() === 'Buscar paciente') {
      formContainer.style.display = 'none';
      buscarSection.style.display = 'block';
      inicioSection.style.display = 'none';
      updateTable();
    }
  });
});

// Botones grandes de inicio
document.getElementById('btnInicioNuevo')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('a[href="#nuevo"]').click();
});
document.getElementById('btnInicioBuscar')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('a[href="#buscar"]').click();
});

// Activar botón
function setActiveButton(clickedBtn) {
  menuButtons.forEach(btn => btn.classList.remove('active'));
  clickedBtn.classList.add('active');
}

// Submit formulario mejorado
document.getElementById('osteoform')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombreInput = document.getElementById('nombre');
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+){1,2}$/;
  
  nombreInput.classList.remove('is-invalid');
  if (!pattern.test(nombreInput.value.trim())) {
    nombreInput.classList.add('is-invalid');
    nombreInput.focus();
    return;
  }
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const allFields=e.target.querySelectorAll('input, select, textarea');
  allFields.forEach(field=>{
    if(!field.name && field.id && !data[field.id]){
      data[field.id]=field.value;
    }
  });
  const now = new Date().toLocaleDateString('es-ES');
  data.primerRegistro = data.primerRegistro || now;
  data.ultimaActualizacion = now;
  pacientes.push(data);
  localStorage.setItem('pacientes', JSON.stringify(pacientes)); // Persistir
  
  e.target.reset();
  imcEl.value = '';
  document.querySelector('a[href="#buscar"]').click(); // Ir a buscar
});


function updateTable() {
  const tbody = document.getElementById('pacientesTableBody');
  tbody.innerHTML = '';
  pacientes.forEach((p, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre || ''}</td>
      <td>${p.edad || ''}</td>
      <td>${p.sexo || ''}</td>
      <td>${p.primerRegistro || ''}</td>
      <td>${p.ultimaActualizacion || ''}</td>
      <td class="d-flex gap-1">
        <button class="btn btn-sm btn-danger" data-index="${index}">Eliminar</button>
        <button class="btn btn-sm btn-warning" data-index="${index}">Editar</button>
        <button class="btn btn-sm btn-info" data-index="${index}">Ver</button>
        <button class="btn btn-sm btn-success" data-index="${index}">Descargar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // Actualizar contadores en cards
  document.querySelector('.card-title').textContent = pacientes.length;
}

// =========== editar paciente =================

// Función para descargar paciente (JSON)
function descargarPaciente(index) {
  const p = pacientes[index];
  if (!p) return;
  
  const dataStr = JSON.stringify(p, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `paciente_${p.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// === EVENT DELEGATION PARA BOTONES DE TABLA ===
document.getElementById('pacientesTableBody')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const index = parseInt(btn.dataset.index);
  if (isNaN(index)) return;
  
  if (btn.textContent.includes('Eliminar')) {
    if (confirm(`¿Eliminar "${pacientes[index]?.nombre || 'paciente'}"?`)) {
      pacientes.splice(index, 1);
      localStorage.setItem('pacientes', JSON.stringify(pacientes));
      updateTable();
    }
  } else if (btn.textContent.includes('Editar')) {
    editPaciente(index);
  } else if (btn.textContent.includes('Descargar')) {
    descargarPaciente(index);
  }
});

// === MODO EDICIÓN (subsección dentro de buscarPacientes) ===
let editMode = false;
let editingIndex = -1;
const editarForm = document.getElementById('editarPacienteForm');

// Función EDITAR paciente
function editPaciente(index) {
  const patient = pacientes[index];
  if (!patient) return;
  
  editMode = true;
  editingIndex = index;
  
  // Ocultar tabla, mostrar form edición
  const tableContainer = document.querySelector('#buscarPacientes .table-responsive') || document.querySelector('#buscarPacientes table').parentElement;
  tableContainer.style.display = 'none';
  editarForm.style.display = 'block';
  
  populateFormCompletamente(patient);
  editarForm.scrollIntoView({ behavior: 'smooth' });
}

function populateFormCompletamente(patientData) {
  // 1. RE LLENAR TODOS LOS CAMPOS por name O id (compatible con tu form)
  Object.keys(patientData).forEach(key => {
    if (key !== 'primerRegistro' && key !== 'ultimaActualizacion' && key !== 'fracturas') {
      // Buscar por name
      let field = editarForm.querySelector(`[name="${key}"]`);
      // Si no existe, buscar por id
      if (!field) field = editarForm.querySelector(`#${key}`);
      // Si aún no, buscar por id sin prefijo
      if (!field) field = editarForm.querySelector(`[id="${key}"]`);
      
      if (field && patientData[key] !== undefined) {
        if (field.type === 'radio' || field.type === 'checkbox') {
          field.checked = field.value == patientData[key];
        } else {
          field.value = patientData[key];
        }
      }
    }
  });

  // 2. IMC (peso, talla → imc)
  setTimeout(() => {
    const pesoField = editarForm.querySelector('#peso');
    const tallaField = editarForm.querySelector('#talla');
    const imcField = editarForm.querySelector('#imc');
    if (pesoField && tallaField && imcField) {
      const p = parseFloat(pesoField.value || 0);
      const t = parseFloat(tallaField.value || 0);
      if (p > 0 && t > 0) {
        imcField.value = (p / Math.pow(t/100, 2)).toFixed(2);
      }
    }
  }, 200);

  // 3. FRACTURAS (específico de tu formulario)
  const fractList = editarForm.querySelector('#fracturasList');
  if (fractList) {
    fractList.innerHTML = '';
    const fracturas = patientData.fracturas || [];
    fracturas.forEach(fract => {
      const loc = fract.fractura_loc || fract.loc || '';
      const edad = fract.fractura_edad || fract.edad || '';
      const num = fract.fractura_num || fract.num || '';
      if (loc) {
        const div = document.createElement('div');
        div.className = 'alert alert-secondary d-flex justify-content-between align-items-center py-1 mb-2';
        div.innerHTML = `<div><strong>${loc}</strong>${edad ? ` — edad: ${edad}` : ''}${num ? ` — n: ${num}` : ''}</div><button type="button" class="btn-close" aria-label="Eliminar"></button>`;
        div.querySelector('.btn-close').addEventListener('click', () => div.remove());
        fractList.appendChild(div);
      }
    });
  }

  // 4. Título paciente
  const cardTitle = editarForm.querySelector('.card-header h4');
  if (cardTitle) {
    cardTitle.innerHTML = `<i class="fas fa-edit me-2"></i>Editando: <strong>${patientData.nombre || 'Paciente'}</strong>`;
  }
}


// Botón VOLVER
document.getElementById('btnVolverEditar')?.addEventListener('click', cancelarEdicion);

function cancelarEdicion() {
  editMode = false;
  editingIndex = -1;
  editarForm.style.display = 'none';
  const tableContainer = document.querySelector('#buscarPacientes .table-responsive') || document.querySelector('#buscarPacientes table').parentElement;
  tableContainer.style.display = '';
  updateTable();
}

// Submit formulario EDICIÓN
editarForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const nombreInput = e.target.querySelector('#nombre');
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+){1,2}$/;
  if (!pattern.test(nombreInput.value.trim())) {
    nombreInput.classList.add('is-invalid');
    return;
  }
  
  // Capturar TODOS los datos
  const formData = new FormData(e.target.closest('form') || editarForm);
  const data = Object.fromEntries(formData.entries());
  const now = new Date().toLocaleDateString('es-ES');

  const allFields=editarForm.querySelectorAll('input, select, textarea');
  allFields.forEach(field=>{
    if(!field.name && field.id && !data[field.id]){
      data[field.id]=field.value;
    }
  });
  
  // Fracturas
  data.fracturas = [];
  const fractDivs = e.target.closest('form')?.querySelectorAll('#fracturasList .alert') || document.querySelectorAll('#fracturasList .alert');
  fractDivs.forEach(div => {
    const text = div.querySelector('div').textContent;
    const match = text.match(/^(.*?)(?:\s*—\s*edad:\s*(\d+))?(?:\s*—\s*n:\s*(\d+))?$/);
    if (match) {
      data.fracturas.push({
        fractura_loc: match[1].trim(),
        fractura_edad: match[2] || '',
        fractura_num: match[3] || ''
      });
    }
  });
  
  // SOBREESCRIBIR
  data.primerRegistro = pacientes[editingIndex].primerRegistro;
  data.ultimaActualizacion = now;
  pacientes[editingIndex] = data;
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
  
  cancelarEdicion();
});

// === FUNCIÓN UPDATE TABLE (actualizada) ===
function updateTable() {
  const tbody = document.getElementById('pacientesTableBody');
  tbody.innerHTML = '';
  pacientes.forEach((p, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre || ''}</td>
      <td>${p.edad || ''}</td>
      <td>${p.sexo || ''}</td>
      <td>${p.primerRegistro || ''}</td>
      <td>${p.ultimaActualizacion || ''}</td>
      <td class="d-flex gap-1">
        <button class="btn btn-sm btn-danger" data-index="${index}">Eliminar</button>
        <button class="btn btn-sm btn-warning" data-index="${index}">Editar</button>
        <button class="btn btn-sm btn-success" data-index="${index}">Descargar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Actualizar contadores dashboard
  const countEls = document.querySelectorAll('#inicio .card h3.card-title');
  if (countEls[0]) countEls[0].textContent = pacientes.length;
}

// Inicializar tabla al cargar
document.addEventListener('DOMContentLoaded', updateTable);
// =========== editar paciente =================