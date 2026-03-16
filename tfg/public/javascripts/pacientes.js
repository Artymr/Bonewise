// ======= gestión de pacientes =======

let pacientes = []; // esta variable se llena desde data.js

//cargar de api
async function cargarPacientes() {
  try {
    const res = await fetch('/api/pacientes');
    if (!res.ok) throw new Error('Error en la API');
    pacientes = await res.json();
    updateTable();
    if (typeof actualizarDashboard === 'function') actualizarDashboard();
    } catch (error) {
    console.error('Error al cargar pacientes desde la API:', error);
    pacientes = [];
  }
}
document.addEventListener('DOMContentLoaded', cargarPacientes);

// submit del formulario de nuevo paciente
document.getElementById('osteoform')?.addEventListener('submit', async e => {
  e.preventDefault();

  const nombre = document.getElementById('nombre');
  const apellidos = document.getElementById('apellidos');

  if (!validarNombre(nombre.value)) {
    nombre.classList.add('is-invalid');
    return;
  }

  if (!validarApellidos(apellidos.value)) {
    apellidos.classList.add('is-invalid');
    return;
  }

  const data = Object.fromEntries(new FormData(e.target));
  data.nombre= `${apellidos.value.trim()}, ${nombre.value.trim()}`;
  delete data.apellidos;
  const now = new Date().toLocaleDateString('es-ES');

  //data.primerRegistro = now;
  //data.ultimaActualizacion = now;

const res = await fetch('/api/pacientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

if (!res.ok) {
  const error = await res.json();
  console.error('Error al crear paciente:', error);
  alert('No se pudo guardar el paciente');
  return;
}

e.target.reset();
document.querySelector('a[href="#buscar"]')?.click();
await cargarPacientes();

});

// Actualizar tabla de pacientes
function updateTable() {
  const tbody = document.getElementById('pacientesTableBody');
  tbody.innerHTML = '';

  pacientes.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.edad}</td>
      <td>${p.sexo}</td>
      <td>${formatearFecha(p.primerRegistro)}</td>
      <td>${formatearFecha(p.ultimaActualizacion)}</td>
      <td>
        <button class="btn btn-sm btn-danger" data-id="${p._id}">Eliminar</button>
        <button class="btn btn-sm btn-warning" data-id="${p._id}">Editar</button>
        <button class="btn btn-sm btn-success" data-id="${p._id}">Descargar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES');
}

// Manejo de botones en la tabla
document.getElementById('pacientesTableBody')?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const id = btn.dataset.id;
  if (!id) return;
  
  if (btn.textContent.includes('Eliminar')) {
    if (confirm(`¿Eliminar "${pacientes.find(p => p._id === id)?.nombre || 'paciente'}"?`)) {
      await fetch(`/api/pacientes/${id}`, { method: 'DELETE' });
      await cargarPacientes();
    }
  } else if (btn.textContent.includes('Editar')) {
    editPaciente(id);
  } else if (btn.textContent.includes('Descargar')) {
    descargarPaciente(id);
  }
});