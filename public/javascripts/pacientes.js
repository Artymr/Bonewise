// ======= gestión de pacientes =======

let pacientes = []; // esta variable se llena desde data.js

let currentSort = {
  field: null,
  direction: 1, // 1 para ascendente, -1 para descendente
};
//cargar de api
async function cargarPacientes() {
  try {
    const res = await fetch("/api/pacientes");
    if (!res.ok) throw new Error("Error en la API");
    pacientes = await res.json();
    updateTable();
    if (typeof actualizarDashboard === "function") actualizarDashboard();
  } catch (error) {
    console.error("Error al cargar pacientes desde la API:", error);
    pacientes = [];
  }
}
//logica de ordenacion
function sortPacientes(field) {
  if (currentSort.field === field) {
    currentSort.direction *= -1; // invertir dirección
  } else {
    currentSort.field = field;
    currentSort.direction = 1; // ascendente por defecto
  }

  pacientes.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    // manejar valores nulos
    if (!valA) return -1;
    if (!valB) return 1;

    // comparar fechas
    if (field.includes("Registro") || field.includes("Actualizacion")) {
      return (new Date(valA) - new Date(valB)) * currentSort.direction;
    }

    //comparar numeros
    if (typeof valA === "number") {
      return (valA - valB) * currentSort.direction;
    }

    //comparar texto
    return (
      valA
        .toString()
        .localeCompare(valB.toString(), "es", { sensitivity: "base" }) *
      currentSort.direction
    );
  });

  updateTable();
  updateSortIcons();
}

// submit del formulario de nuevo paciente
document.getElementById("osteoform")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre");
  const apellidos = document.getElementById("apellidos");

  if (!validarNombre(nombre.value)) {
    nombre.classList.add("is-invalid");
    return;
  }

  if (!validarApellidos(apellidos.value)) {
    apellidos.classList.add("is-invalid");
    return;
  }

  const data = Object.fromEntries(new FormData(e.target));
  data.nombre = `${apellidos.value.trim()}, ${nombre.value.trim()}`;
  delete data.apellidos;
  const now = new Date().toLocaleDateString("es-ES");

  //data.primerRegistro = now;
  //data.ultimaActualizacion = now;

  const res = await fetch("/api/pacientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Error al crear paciente:", error);
    alert("No se pudo guardar el paciente");
    return;
  }

  e.target.reset();
  document.querySelector('a[href="#buscar"]')?.click();
  await cargarPacientes();
});

// Actualizar tabla de pacientes
function updateTable() {
  const tbody = document.getElementById("pacientesTableBody");
  tbody.innerHTML = "";

  pacientes.forEach((p, i) => {
    const tr = document.createElement("tr");
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

//flechas de ordenacion
function updateSortIcons() {
  document.querySelectorAll(".sortable").forEach((th) => {
    const field = th.dataset.field;
    //limpiar iconos
    th.innerHTML = th.textContent.replace(/[\u25B2\u25BC]/g, "").trim();

    if (field === currentSort.field) {
      const arrow = currentSort.direction === 1 ? " \u25B2" : " \u25BC";
      th.innerHTML += arrow;
    }
  });
}

function formatearFecha(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-ES");
}

// Manejo de botones en la tabla
document
  .getElementById("pacientesTableBody")
  ?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) return;

if (btn.textContent.includes("Eliminar")) {
      const nombre = pacientes.find((p) => p._id === id)?.nombre || "paciente";
      const confirmado = await confirmarEliminar(nombre);
      if (confirmado) {
        await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
        await cargarPacientes();
      }
    } else if (btn.textContent.includes("Editar")) {
      editPaciente(id);
    } else if (btn.textContent.includes("Descargar")) {
      descargarPaciente(id);
    }
  });
//modal para no romper al borrar
function confirmarEliminar(nombre) {
  return new Promise((resolve) => {
    // Crear modal si no existe
    let modal = document.getElementById("modalConfirmarEliminar");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modalConfirmarEliminar";
      modal.className = "modal fade";
      modal.tabIndex = -1;
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmar eliminación</h5>
            </div>
            <div class="modal-body" id="modalConfirmarTexto"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btnCancelarEliminar">Cancelar</button>
              <button type="button" class="btn btn-danger" id="btnAceptarEliminar">Eliminar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    document.getElementById("modalConfirmarTexto").textContent = `¿Eliminar "${nombre}"?`;

    const bsModal = new bootstrap.Modal(modal);

    const btnAceptar = document.getElementById("btnAceptarEliminar");
    const btnCancelar = document.getElementById("btnCancelarEliminar");

    // Limpiar listeners anteriores
    const nuevoAceptar = btnAceptar.cloneNode(true);
    const nuevoCancelar = btnCancelar.cloneNode(true);
    btnAceptar.replaceWith(nuevoAceptar);
    btnCancelar.replaceWith(nuevoCancelar);

    nuevoAceptar.addEventListener("click", () => { bsModal.hide(); resolve(true); });
    nuevoCancelar.addEventListener("click", () => { bsModal.hide(); resolve(false); });
    modal.addEventListener("hidden.bs.modal", () => resolve(false), { once: true });

    bsModal.show();
  });
}


document.addEventListener("DOMContentLoaded", () => {
  cargarPacientes();

  document.querySelectorAll(".sortable").forEach((th) => {
    th.computedStyleMap.cursor = "pointer";
    th.addEventListener("click", () => {
      const field = th.dataset.field;
      sortPacientes(field);
    });
  });
});
