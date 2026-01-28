const tbody = document.getElementById('tablaPacientes');
const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

pacientes.forEach((p, i) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${p.nombre}</td>
    <td>${p.edad}</td>
    <td>${new Date(p.createdAt).toLocaleDateString()}</td>
    <td>
      <button class="btn btn-danger btn-sm" onclick="deletePaciente(${i})">
        Eliminar
      </button>
    </td>
  `;
  tbody.appendChild(tr);
});

function deletePaciente(index) {
  pacientes.splice(index, 1);
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
  location.reload();
}
