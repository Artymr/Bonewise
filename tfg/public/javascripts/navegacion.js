// ======= scripts de navegación y visibilidad de secciones =======

// Elementos principales
const formContainer = document.getElementById('osteoform');
const buscarSection = document.getElementById('buscarPacientes');
const inicioSection = document.getElementById('inicio');
const menuButtons = document.querySelectorAll('.navbar-nav .nav-link');

// Función para establecer botón activo
function setActiveButton(clickedBtn) {
  menuButtons.forEach(btn => btn.classList.remove('active'));
  clickedBtn.classList.add('active');
}

// Función para bloquear/desbloquear menú
function bloquearMenu(bloquear) {
  menuButtons.forEach(btn => {
    if (bloquear) {
      btn.classList.add('disabled');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.5';
    } else {
      btn.classList.remove('disabled');
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
    }
  });
}

// Navegación entre secciones
menuButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    setActiveButton(btn);

    const text = btn.textContent.trim();

    formContainer.style.display = text === 'Nuevo paciente' ? 'block' : 'none';
    buscarSection.style.display = text === 'Buscar paciente' ? 'block' : 'none';
    inicioSection.style.display = text === 'Inicio' ? 'block' : 'none';

    if (text === 'Buscar paciente') updateTable();
  });
});

// Botones de inicio
document.getElementById('btnInicioNuevo')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('a[href="#nuevo"]').click();
});
document.getElementById('btnInicioBuscar')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('a[href="#buscar"]').click();
});

// inicializacion al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    inicioSection.style.display = 'block';
    formContainer.style.display = 'none';
    buscarSection.style.display = 'none';

    const inicioBtn=document.querySelector('a[href="#inicio"]');
    if(inicioBtn) setActiveButton(inicioBtn);
});