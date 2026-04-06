// ======= edición de pacientes =======

// === MODO EDICIÓN (subsección dentro de buscarPacientes) ===
let editMode = false;
let editingPaciente = null;
const editarForm = document.getElementById("editarPacienteForm");

//limpiar errores dinamicamente
editarForm?.addEventListener("input", (e) => {
  if (e.target.classList.contains("is-invalid")) {
    e.target.classList.remove("is-invalid");
  }
});

// Función para descargar paciente (JSON)
function descargarPaciente(id) {
  const p = pacientes.find((p) => p._id === id);
  if (!p) return;

  const dataStr = JSON.stringify(p, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `paciente_${p.nombre.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Función EDITAR paciente
let editingId = null;
function editPaciente(id) {
  const patient = pacientes.find((p) => p._id === id);
  if (!patient) return;

  editMode = true;
  editingId = id;
  editingPaciente = patient;
  bloquearMenu(true);
  limpiarResultadoTratamiento(); // Limpiar resultado previo al entrar en edición

  // Ocultar tabla, mostrar form edición
  const tableContainer =
    document.querySelector("#buscarPacientes .table-responsive") ||
    document.querySelector("#buscarPacientes table").parentElement;
  tableContainer.style.display = "none";
  editarForm.style.display = "block";

  const btnReset = editarForm.querySelector('#btnLimpiar');
  if (btnReset) btnReset.style.display = "none"; // Ocultar botón reset en modo edición
  populateFormCompletamente(patient);
  editarForm.scrollIntoView({ behavior: "smooth" });
}

// Función para resetear campos dinámicos (checkboxes "otro" y sus inputs)
function resetCamposDinamicos() {
  // Ocultar y limpiar inputs "otro"
  const camposTexto = ["#fract_otro_text", "#enf_otro_text"];

  camposTexto.forEach((selector) => {
    const input = editarForm.querySelector(selector);
    if (input) {
      input.value = "";
      input.classList.add("d-none");
    }
  });

  // Desmarcar TODOS los checkboxes
  editarForm
    .querySelectorAll(".fractura-check, .enf_asoc-check")
    .forEach((chk) => {
      chk.checked = false;
    });
}

// Función para rellenar el formulario de edición completamente (lo que hace que funcione el editar)
function populateFormCompletamente(patientData) {
  resetCamposDinamicos();
  if (patientData.nombre && patientData.nombre.includes(",")) {
    const [apellidos, nombre] = patientData.nombre.split(",");
    editarForm.querySelector("#nombre").value = nombre.trim();
    editarForm.querySelector("#apellidos").value = apellidos.trim();
  }
  Object.keys(patientData).forEach((key) => {
    if (
      key !== "primerRegistro" &&
      key !== "ultimaActualizacion" &&
      key !== "fracturas" &&
      key !== "nombre"
    ) {
      let field = editarForm.querySelector(`[name="${key}"]`);
      if (!field) field = editarForm.querySelector(`#${key}`);
      if (!field) field = editarForm.querySelector(`[id="${key}"]`);

      if (field && patientData[key] !== undefined) {
        if (field.type === "radio" || field.type === "checkbox") {
          field.checked = field.value == patientData[key];
        } else {
          field.value = patientData[key];
        }
      }
    }
  });

  // actualizar valores de los sliders T-score
  const sliders = editarForm.querySelectorAll(".t-score");
  sliders.forEach((slider) => {
    const container = slider.closest(".col-md-4");
    const valueSpan = container?.querySelector(".t-score-val");
    if (valueSpan) {
      valueSpan.textContent = slider.value;
    }
  });

  calcularRiesgoDMO(); // Calcular riesgo DMO al cargar la página

  // Actualizar título del formulario de edición
  const cardTitle = editarForm.querySelector(".card-header h4");
  if (cardTitle) {
    cardTitle.innerHTML = `<i class="fas fa-edit me-2"></i>Editando: <strong>${patientData.nombre || "Paciente"}</strong>`;
  }

  // restaurar fracturas previas
  if (patientData.fract_previa) {
    const valores = patientData.fract_previa.split(",").map((v) => v.trim());
    editarForm.querySelectorAll(".fractura-check").forEach((chk) => {
      chk.checked = false;
      if (chk.value === "otro") {
        const otro = valores.find((v) => v.toLowerCase().startsWith("otro:"));
        if (otro) {
          chk.checked = true;
          const texto = otro.replace(/^otro:\s*/i, "").trim();
          const input = editarForm.querySelector("#fract_otro_text");
          if (input) {
            input.value = texto;
            input.classList.remove("d-none");
          }
        }
      } else if (valores.includes(chk.value)) {
        chk.checked = true;
      }
    });
  }

  // restaurar enfermedades asociadas
  if (patientData.enfermedades_asociadas) {
    const valores = patientData.enfermedades_asociadas
      .split(",")
      .map((v) => v.trim());
    editarForm.querySelectorAll(".enf_asoc-check").forEach((chk) => {
      chk.checked = false;
      if (chk.value === "otro") {
        const otro = valores.find((v) => v.toLowerCase().startsWith("otro:"));
        if (otro) {
          chk.checked = true;
          const texto = otro.replace(/^otro:\s*/i, "").trim();
          const input = editarForm.querySelector("#enf_otro_text");
          if (input) {
            input.value = texto;
            input.classList.remove("d-none");
          }
        }
      } else if (valores.includes(chk.value)) {
        chk.checked = true;
      }
    });
  }

  ["trasplantes", "oncologicas", "osteo_sec"].forEach((campo) => {
    const select = editarForm.querySelector(`#${campo}`);
    if (select && patientData[campo] !== undefined) {
      select.value = patientData[campo];
    }
  });

  recalcularCamposDependientes();
}

// Botón VOLVER
document
  .getElementById("btnVolverEditar")
  ?.addEventListener("click", cancelarEdicion);

// Función para cancelar edición
function cancelarEdicion() {
  editMode = false;
  bloquearMenu(false);
  const btnReset = editarForm.querySelector('#btnLimpiar');
  if (btnReset) btnReset.style.display = ""; // Mostrar botón reset al salir de edición
  editarForm.style.display = "none";
  const tableContainer =
    document.querySelector("#buscarPacientes .table-responsive") ||
    document.querySelector("#buscarPacientes table").parentElement;
  tableContainer.style.display = "";
  updateTable();
}
//funcion para scrollear al error
function scrollToFirstError() {
  const firstError = editarForm.querySelector(".is-invalid");
  if (firstError) {
    const container = firstError.closest(".mb-3") || firstError;
    container.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setTimeout(() => firstError.focus(), 500);
  }
}

// Submit formulario EDICIÓN
editarForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  //Limpiar errores previos
  editarForm.querySelectorAll(".is-invalid").forEach((el) => {
    el.classList.remove("is-invalid");
  });
  const nombreInput = editarForm.querySelector("#nombre");
  const apellidosInput = editarForm.querySelector("#apellidos");

  let hayError = false;
  if (!validarNombre(nombreInput.value)) {
    nombreInput.classList.add("is-invalid");
    hayError = true;
  }
  if (!validarApellidos(apellidosInput.value)) {
    apellidosInput.classList.add("is-invalid");
    hayError = true;
  }

  //si hay error, scroll al primero
  if (hayError) {
    scrollToFirstError();
    return;
  }

  // Recopilar datos
  const formData = new FormData(e.target.closest("form") || editarForm);
  const data = Object.fromEntries(formData.entries());
  const now = new Date().toLocaleDateString("es-ES");

  data.trasplantes = editarForm.querySelector("#trasplantes")?.value || "";
  data.oncologicas = editarForm.querySelector("#oncologicas")?.value || "";
  data.osteo_sec = editarForm.querySelector("#osteo_sec")?.value || "";

  //combinar nombre y apellidos
  data.nombre = `${apellidosInput.value.trim().toUpperCase()}, ${nombreInput.value.trim().toUpperCase()}`;
  delete data.apellidos;

  // Recopilar fracturas
  data.fracturas = [];
  const fractDivs =
    e.target.closest("form")?.querySelectorAll("#fracturasList .alert") ||
    document.querySelectorAll("#fracturasList .alert");
  fractDivs.forEach((div) => {
    const text = div.querySelector("div").textContent;
    const match = text.match(
      /^(.*?)(?:\s*—\s*edad:\s*(\d+))?(?:\s*—\s*n:\s*(\d+))?$/,
    );
    if (match) {
      data.fracturas.push({
        fractura_loc: match[1].trim(),
        fractura_edad: match[2] || "",
        fractura_num: match[3] || "",
      });
    }
  });

  // Mantener fechas originales
  data.primerRegistro = editingPaciente.primerRegistro;
  data.ultimaActualizacion = new Date();

  try {
    const res = await fetch(`/api/pacientes/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar");
    await res.json();
  } catch (err) {
    console.error("Error al actualizar paciente:", err);
    alert("Error al actualizar paciente");
    return;
  }

  //listeners para "otros" en fracturas y enfermedades asociadas
  const editFractOtroCheck = editarForm?.querySelector("#fract_otro");
  const editFractOtroText = editarForm?.querySelector("#fract_otro_text");
  editFractOtroCheck?.addEventListener("change", () => {
    editFractOtroText?.classList.toggle("d-none", !editFractOtroCheck.checked);
    if (!editFractOtroCheck.checked) editFractOtroText.value = "";
  });

  const editEnfOtroCheck = editarForm?.querySelector("#enf_otro");
  const editEnfOtroText = editarForm?.querySelector("#enf_otro_text");
  editEnfOtroCheck?.addEventListener("change", () => {
    editEnfOtroText?.classList.toggle("d-none", !editEnfOtroCheck.checked);
    if (!editEnfOtroCheck.checked) editEnfOtroText.value = "";
  });

  bloquearMenu(false);
  actualizarDashboard();
  await cargarPacientes(); // Recarga la lista desde MongoDB
  cancelarEdicion();
});
