 // Calcular IMC
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
    pesoEl.addEventListener('input', calcIMC);
    tallaEl.addEventListener('input', calcIMC);

    // Añadir fractura dinámica
    const addFract = document.getElementById('addFract');
    const fracturasList = document.getElementById('fracturasList');
    addFract.addEventListener('click', ()=>{
      const loc = document.getElementById('fractura_loc').value.trim();
      const edad = document.getElementById('fractura_edad').value.trim();
      const num = document.getElementById('fractura_num').value.trim();
      if(!loc && !edad) return;
      const div = document.createElement('div');
      div.className = 'alert alert-secondary d-flex justify-content-between align-items-center py-1';
      div.innerHTML = `<div><strong>${loc}</strong>${edad?` — edad: ${edad}`:''}${num?` — n: ${num}`:''}</div><button type=\"button\" class=\"btn-close\" aria-label=\"Eliminar\"></button>`;
      div.querySelector('.btn-close').addEventListener('click', ()=>div.remove());
      fracturasList.appendChild(div);
      document.getElementById('fractura_loc').value='';
      document.getElementById('fractura_edad').value='';
      document.getElementById('fractura_num').value='';
    });

  // Referencia al formulario principal
const formContainer = document.getElementById('osteoform');
const buscarSection = document.getElementById('buscarPacientes');
const inicioSection = document.getElementById('inicio');

// Ocultar formulario al inicio pero dejar contenedor visible
formContainer.style.display = 'none';


  // Botones del menú
  const btnInicio = document.querySelector('a[href="#inicio"]');
  const btnNuevo = document.querySelector('a[href="#nuevo"]');
  const btnBuscar = document.querySelector('a[href="#buscar"]');

  // Si los botones no tienen esos href, los asignamos manualmente
  const menuLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const [inicioLink, nuevoLink, buscarLink] = menuLinks;

  inicioLink.addEventListener('click', (e) => {
  e.preventDefault();
  formContainer.style.display = 'none';
  buscarSection.style.display = 'none';
  inicioSection.style.display = 'block';
});

nuevoLink.addEventListener('click', (e) => {
  e.preventDefault();
  buscarSection.style.display = 'none';
  formContainer.style.display = 'block';
  inicioSection.style.display = 'none';
});

buscarLink.addEventListener('click', (e) => {
  e.preventDefault();
  formContainer.style.display = 'none';
  buscarSection.style.display = 'block';
  inicioSection.style.display = 'none';
  updateTable(); // asegura que se actualiza la tabla
});


  // Selecciona todos los botones del menú central
const menuButtons = document.querySelectorAll('.navbar-nav .nav-link');

// Función para activar solo el botón pulsado
function setActiveButton(clickedBtn) {
  menuButtons.forEach(btn => btn.classList.remove('active')); // quitar active de todos
  clickedBtn.classList.add('active'); // añadir active al pulsado
}

// Agregar listener a cada botón
menuButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // evitar comportamiento default del href
    setActiveButton(btn);

    // Mostrar/ocultar formulario según el botón
    if (btn.textContent.trim() === "Nuevo paciente") {
      formContainer.style.display = 'block';
    } else {
      formContainer.style.display = 'none';
    }
  });
});
const pacientes = []; // Array donde guardamos los pacientes

document.getElementById('osteoform').addEventListener('submit', (e) => {
  e.preventDefault();

  const nombreInput = document.getElementById('nombre');
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+){1,2}$/;
  
  // Quitamos error previo si existía
  nombreInput.classList.remove('is-invalid');

  // Validación de nombre
  if (!pattern.test(nombreInput.value.trim())) {
    nombreInput.classList.add('is-invalid'); // 🔴 Aplica borde rojo y muestra mensaje
    nombreInput.focus();
    return; // Detiene el guardado
  }

  // Si el nombre es válido → continuar con el guardado
  const data = Object.fromEntries(new FormData(e.target).entries());
  pacientes.push(data);

  e.target.reset();
  imcEl.value = '';

  // Mostrar sección buscar pacientes
  formContainer.style.display = 'none';
  buscarSection.style.display = 'block';
  setActiveButton(buscarLink);
  updateTable();
});


// Función para actualizar la tabla
function updateTable() {
  const tbody = document.getElementById('pacientesTableBody');
  tbody.innerHTML = '';
  pacientes.forEach((p, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre || ''}</td>
      <td>${p.edad || ''}</td>
      <td>${p.sexo || ''}</td>
      <td>${p.peso || ''}</td>
      <td>${p.talla || ''}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deletePaciente(${index})">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Función para eliminar paciente
function deletePaciente(index) {
  pacientes.splice(index, 1);
  updateTable();
}