// ======= datos almacenados =======

// Lista de pacientes almacenados en localStorage
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

// Función para guardar pacientes en localStorage
function guardarPacientes() {
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
}