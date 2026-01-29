// ======= gestión de pacientes =======

// submit del formulario de nuevo paciente
document.getElementById('osteoform')?.addEventListener('submit', e => {
  e.preventDefault();

  const nombre = document.getElementById('nombre');

  if (!validarNombre(nombre.value)) {
    nombre.classList.add('is-invalid');
    return;
  }

  const data = Object.fromEntries(new FormData(e.target));
  const now = new Date().toLocaleDateString('es-ES');

  data.primerRegistro = now;
  data.ultimaActualizacion = now;

  pacientes.push(data);
  guardarPacientes();

  e.target.reset();
  document.querySelector('a[href="#buscar"]').click();
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
      <td>${p.primerRegistro}</td>
      <td>${p.ultimaActualizacion}</td>
      <td>
        <button class="btn btn-sm btn-danger" data-i="${i}">Eliminar</button>
        <button class="btn btn-sm btn-warning" data-i="${i}">Editar</button>
        <button class="btn btn-sm btn-success" data-i="${i}">Descargar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Manejo de botones en la tabla
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
      actualizarDashboard();
    }
  } else if (btn.textContent.includes('Editar')) {
    editPaciente(index);
  } else if (btn.textContent.includes('Descargar')) {
    descargarPaciente(index);
  }
});