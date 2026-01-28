const form = document.getElementById('formPaciente');

form.addEventListener('submit', e => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));
  data.createdAt = new Date().toISOString();
  data.updatedAt = data.createdAt;

  const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
  pacientes.push(data);

  localStorage.setItem('pacientes', JSON.stringify(pacientes));

  window.location.href = "/buscar";
});
