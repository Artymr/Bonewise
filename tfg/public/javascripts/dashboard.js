// ======= scripts del dashboard =======

// Actualizar estadísticas del dashboard
function actualizarDashboard() {
  const hoy = new Date().toLocaleDateString('es-ES');

  const totalPacientes = pacientes.length;
  const diagnosticosHoy = pacientes.filter(p => new Date(p.ultimaActualizacion).toLocaleDateString('es-ES') === hoy).length;

  const cards = document.querySelectorAll('#inicio .card h3.card-title');
  if (cards[0]) cards[0].textContent = totalPacientes;
  if (cards[1]) cards[1].textContent = diagnosticosHoy;
}
