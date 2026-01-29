// ======= edición de pacientes =======

// === MODO EDICIÓN (subsección dentro de buscarPacientes) ===
let editMode = false;
let editingIndex = -1;
const editarForm = document.getElementById('editarPacienteForm');

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

// Función EDITAR paciente
function editPaciente(index) {
  const patient = pacientes[index];
  if (!patient) return;
  
  editMode = true;
  editingIndex = index;
  bloquearMenu(true);
  
  // Ocultar tabla, mostrar form edición
  const tableContainer = document.querySelector('#buscarPacientes .table-responsive') || document.querySelector('#buscarPacientes table').parentElement;
  tableContainer.style.display = 'none';
  editarForm.style.display = 'block';
  
  populateFormCompletamente(patient);
  editarForm.scrollIntoView({ behavior: 'smooth' });
}

// Función para rellenar el formulario de edición completamente
function populateFormCompletamente(patientData) {
  Object.keys(patientData).forEach(key => {
    if (key !== 'primerRegistro' && key !== 'ultimaActualizacion' && key !== 'fracturas') {
      let field = editarForm.querySelector(`[name="${key}"]`);
      if (!field) field = editarForm.querySelector(`#${key}`);
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
  // recalcular IMC 
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

  // cargar fracturas
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

  // Actualizar título del formulario de edición
  const cardTitle = editarForm.querySelector('.card-header h4');
  if (cardTitle) {
    cardTitle.innerHTML = `<i class="fas fa-edit me-2"></i>Editando: <strong>${patientData.nombre || 'Paciente'}</strong>`;
  }
}

// Botón VOLVER
document.getElementById('btnVolverEditar')?.addEventListener('click', cancelarEdicion);

// Función para cancelar edición
function cancelarEdicion() {
  editMode = false;
  editingIndex = -1;
  bloquearMenu(false);
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

  // Recopilar datos
  const formData = new FormData(e.target.closest('form') || editarForm);
  const data = Object.fromEntries(formData.entries());
  const now = new Date().toLocaleDateString('es-ES');

  const allFields=editarForm.querySelectorAll('input, select, textarea');
  allFields.forEach(field=>{
    if(!field.name && field.id && !data[field.id]){
      data[field.id]=field.value;
    }
  });
  
  // Recopilar fracturas
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
  
  // Actualizar paciente en la lista
  data.primerRegistro = pacientes[editingIndex].primerRegistro;
  data.ultimaActualizacion = now;
  pacientes[editingIndex] = data;
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
  bloquearMenu(false);
  actualizarDashboard();
  
  cancelarEdicion();
});