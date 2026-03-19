// ======= edición de pacientes =======

// === MODO EDICIÓN (subsección dentro de buscarPacientes) ===
let editMode = false;
let editingPaciente= null;
const editarForm = document.getElementById('editarPacienteForm');

//limpiar errores dinamicamente
editarForm?.addEventListener('input', e => {
  if (e.target.classList.contains('is-invalid')) {
    e.target.classList.remove('is-invalid');
  }
});
function bloquearMenu(bloquear) {
  const menuItems = document.querySelectorAll('#menu a');
  menuItems.forEach(item => {
    if (bloquear) {
      item.classList.add('disabled');
      item.setAttribute('aria-disabled', 'true');
    } else {
      item.classList.remove('disabled');
      item.removeAttribute('aria-disabled');
    }
  });
}
function actualizarDashboard() {
  if (typeof actualizarDashboard === 'function') {
    actualizarDashboard();
  }
}

// Función para descargar paciente (JSON)
function descargarPaciente(id) {
  const p = pacientes.find(p => p._id === id);
  if (!p) return;

  const dataStr = JSON.stringify(p, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `paciente_${p.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}


// Función EDITAR paciente
let editingId= null;
function editPaciente(id) {
  const patient = pacientes.find(p => p._id === id);
  if (!patient) return;
  
  editMode = true;
  editingId= id;
  editingPaciente = patient;
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
  if (patientData.nombre && patientData.nombre.includes(',')) {
    const [apellidos, nombre] = patientData.nombre.split(',');
    editarForm.querySelector('#nombre').value = nombre.trim();
    editarForm.querySelector('#apellidos').value = apellidos.trim();
  }
  Object.keys(patientData).forEach(key => {
    if (key !== 'primerRegistro' && key !== 'ultimaActualizacion' && key !== 'fracturas' && key !== 'nombre') {
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

  // actualizar valores de los sliders T-score
  const sliders = editarForm.querySelectorAll('.t-score');
  sliders.forEach(slider => {
    const container = slider.closest('.col-md-4');
    const valueSpan = container?.querySelector('.t-score-val');
    if (valueSpan) {
      valueSpan.textContent = slider.value;
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
  bloquearMenu(false);
  editarForm.style.display = 'none';
  const tableContainer = document.querySelector('#buscarPacientes .table-responsive') || document.querySelector('#buscarPacientes table').parentElement;
  tableContainer.style.display = '';
  updateTable();
}
  //funcion para scrollear al error
  function scrollToFirstError() {
    const firstError = editarForm.querySelector('.is-invalid');
    if (firstError) {
      const container = firstError.closest('.mb-3') || firstError;
      container.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      setTimeout(() => firstError.focus(), 500);
    }
  }

// Submit formulario EDICIÓN
editarForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  //Limpiar errores previos
  editarForm.querySelectorAll('.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
  });
  const nombreInput = editarForm.querySelector('#nombre');
  const apellidosInput = editarForm.querySelector('#apellidos');

  let hayError = false;
  if (!validarNombre(nombreInput.value)) {
    nombreInput.classList.add('is-invalid');
    hayError = true;
  }
  if (!validarApellidos(apellidosInput.value)) {
    apellidosInput.classList.add('is-invalid');
    hayError = true;
  }

  //si hay error, scroll al primero
  if (hayError) {
    scrollToFirstError();
    return;
  }

  // Recopilar datos
  const formData = new FormData(e.target.closest('form') || editarForm);
  const data = Object.fromEntries(formData.entries());
  const now = new Date().toLocaleDateString('es-ES');

  //combinar nombre y apellidos
  data.nombre= `${apellidosInput.value.trim()}, ${nombreInput.value.trim()}`;
  delete data.apellidos;

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
  
// Mantener fechas originales
data.primerRegistro = editingPaciente.primerRegistro;
data.ultimaActualizacion = new Date();

try {
  const res = await fetch(`/api/pacientes/${editingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar');
  await res.json();
} catch (err) {
  console.error('Error al actualizar paciente:', err);
  alert('Error al actualizar paciente');
  return;
}

bloquearMenu(false);
actualizarDashboard();
await cargarPacientes();  // Recarga la lista desde MongoDB
cancelarEdicion();

});