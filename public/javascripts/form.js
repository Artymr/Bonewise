// ======= scripts específicos del formulario =======

// Cálculo automático del IMC (índice de masa corporal)
// ─── Helper: devuelve el campo del formulario activo ───────────────────────
// Cuando el formulario de edición está visible (display:block), busca dentro
// de él; si no, usa el formulario de nuevo paciente (comportamiento normal).
function getActiveField(id) {
  const ef = document.getElementById("editarPacienteForm");
  if (ef && ef.style.display === "block") {
    const field = ef.querySelector("#" + id);
    if (field) return field;
  }
  return document.getElementById(id);
}

// ─── Cálculo IMC ───────────────────────────────────────────────────────────
function calcIMC() {
  const pesoField  = getActiveField("peso");
  const tallaField = getActiveField("talla");
  const imcField   = getActiveField("imc");
  if (!pesoField || !tallaField || !imcField) return;
  const p = parseFloat(pesoField.value);
  const t = parseFloat(tallaField.value);
  if (p > 0 && t > 0) {
    imcField.value = (p / Math.pow(t / 100, 2)).toFixed(2);
  } else {
    imcField.value = "";
  }
}

// Event delegation: captura peso/talla de CUALQUIER formulario del DOM
document.addEventListener("input", (e) => {
  if (e.target.id === "peso" || e.target.id === "talla") {
    calcIMC();
  }
});

//validacion en el formulario
function validarNombre(nombre) {
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/;
  return pattern.test(nombre.trim());
}

function validarApellidos(apellidos) {
  const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]+)+$/;
  return pattern.test(apellidos.trim());
}

//validar mientras se escribe
const nombreInput = document.getElementById("nombre");
const apellidosInput = document.getElementById("apellidos");

nombreInput?.addEventListener("input", () => {
  nombreInput.value = nombreInput.value.toUpperCase();
});

apellidosInput?.addEventListener("input", () => {
  apellidosInput.value = apellidosInput.value.toUpperCase();
});


nombreInput?.addEventListener("blur", () => {
  if (nombreInput.value.trim() && !validarNombre(nombreInput.value)) {
    nombreInput.classList.add("is-invalid");
  } else {
    nombreInput.classList.remove("is-invalid");
  }
});

apellidosInput?.addEventListener("blur", () => {
  if (apellidosInput.value.trim() && !validarApellidos(apellidosInput.value)) {
    apellidosInput.classList.add("is-invalid");
  } else {
    apellidosInput.classList.remove("is-invalid");
  }
});

// ======= T-SCORE sliders =======
// Esta función servirá para cualquier slider en cualquier parte del DOM
function updateTScoreText(slider) {
  const container = slider.closest(".col-md-4, .form-group, .mb-3");
  const valueSpan = container?.querySelector(".t-score-val");
  if (valueSpan) {
    valueSpan.textContent = slider.value;
  }
}

// Escuchar cambios manuales del usuario
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("t-score")) {
    updateTScoreText(e.target);
    calcularRiesgoDMO(); // Recalcular riesgo DMO al cambiar cualquier T-score
  }
});

// Sincronización inicial para el formulario de "Nuevo Paciente"
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".t-score").forEach((s) => updateTScoreText(s));
  calcularRiesgoDMO(); // Calcular riesgo DMO al cargar la página
});

// ======= Cálculo FRAX aproximado mejorado (para España) =======
function calcFraxMejorado() {
  const edad = Number(getActiveField("edad")?.value) || 0;
  const sexo = getActiveField("sexo")?.value === "Femenino"; // true si femenino
  const peso = Number(getActiveField("peso")?.value) || 0;
  const talla = Number(getActiveField("talla")?.value) || 0;
  const tCuello = Number(getActiveField("t_cuello")?.value) || null;

  const fraxOutPut = getActiveField("riesgo_frax");
  if (!fraxOutPut) return;

  if (!edad || peso <= 0 || talla <= 0) {
    fraxOutPut.value = "";
    return;
  }

  const imc = peso / Math.pow(talla / 100, 2);

  // 1. Base + edad + sexo (aprox FRAX España mujer 50a ~ -3.0 logit)
  let logit = -4.0 + 0.058 * Math.max(0, edad - 50) + (sexo ? 0.42 : 0);

  // 2. Factores de riesgo (betas FRAX approx)
  const fracturas = getActiveField("fract_previa")?.value || "";
  if (fracturas && fracturas !== "no") logit += 1.0;
  if (getActiveField("fx_cadera_fam")?.value === "si") logit += 0.5;
  if (getActiveField("tabaquismo")?.value === "Fumador actual") logit += 0.36;
  if (getActiveField("tabaquismo")?.value === "Exfumador") logit += 0.18;
  if (getActiveField("alcohol")?.value === "si") logit += 0.34;
  if (getActiveField("corticoides")?.value === "si") logit += 0.57;
  if (getActiveField("artritis")?.value === "si") logit += 0.69;
  if (getActiveField("osteo_sec")?.value === "si") logit += 0.46;

  // 3. IMC continuo (penaliza bajo)
  logit += Math.max(-0.1 * (25 - imc), 0); // + si IMC <25

  // 4. T-score continuo (clave: gradual!)
  if (tCuello !== null && !isNaN(tCuello)) {
    logit += 0.45 * -tCuello; // ~doble riesgo por SD
  }

  // 5. Probabilidad 10a
  const risk = 100 / (1 + Math.exp(-logit));
  const porcentaje = Math.min(risk.toFixed(1), 30.0); // Cap realista

  fraxOutPut.value = porcentaje;
}

// Helper para checkboxes (adapta IDs)
function getCheckbox(id) {
  return getActiveField(id)?.checked || false;
}

//calcular riesgo dmo
function calcularRiesgoDMO() {
  const tLumbar = parseFloat(getActiveField("t_lumbar")?.value);
  const tCuello = parseFloat(getActiveField("t_cuello")?.value);
  const riesgoInput = getActiveField("riesgo_dmo");

  if (!riesgoInput) return;

  if (isNaN(tLumbar) || isNaN(tCuello)) {
    riesgoInput.value = "";
    return;
  }

  const peor = Math.min(tLumbar, tCuello);
  let riesgo = "";
  if (peor >= -1) {
    riesgo = "Bajo";
  } else if (peor >= -2.5) {
    riesgo = "Moderado";
  } else if (peor >= -3.5) {
    riesgo = "Alto";
  } else {
    riesgo = "Muy alto";
  }
  riesgoInput.value = riesgo;
  calcularRiesgoTotal();
}

//calcular riesgo total
function calcularRiesgoTotal() {
  const niveles = ["Bajo", "Moderado", "Alto", "Muy alto"];
  const riesgoDMO = getActiveField("riesgo_dmo")?.value;
  const riesgoTotalInput = getActiveField("riesgo_total");

  if (!riesgoTotalInput) return;

  if (!riesgoDMO || !niveles.includes(riesgoDMO)) {
    riesgoTotalInput.value = "";
    return;
  }

  let nivel = niveles.indexOf(riesgoDMO);

  //Condicion 1: al menos un "si" en fracturas previas
  const fractPrevia = getActiveField("fract_previa")?.value || "";
  const valoresFract = fractPrevia.split(",").map(v => v.trim().toLowerCase());
  const tieneFractura = valoresFract.some(v => v && v !== "no");
  if (tieneFractura) nivel++;

  //Condicion 2: corticoides "si
  if (getActiveField("corticoides")?.value === "si") nivel++;

  //Condicion 3: fumador o exfumador Y menopausia < 45
  const tabaco = getActiveField("tabaquismo")?.value || "";
  const esFumador = tabaco === "Fumador Actual" || tabaco === "Exfumador";
  const menopausia = parseFloat(getActiveField("menopausia")?.value);
  if (esFumador && !isNaN(menopausia) && menopausia < 45) nivel++;

  //Limitar a "Muy alto"
  nivel = Math.min(nivel, niveles.length - 1);
  riesgoTotalInput.value = niveles[nivel];
}

//Helper
function getActiveForm() {
  const ef = document.getElementById("editarPacienteForm");
  if (ef && ef.style.display === "block") return ef;
  return document.getElementById("osteoform");
}

//logica de fracturas previas
const fractChecks = document.querySelectorAll(".fractura-check");
const fractNo = document.getElementById("fract_no");
const fracturasInput = document.getElementById("fract_previa");

fractChecks.forEach((chk) => {
  chk.addEventListener("change", () => {
    if (chk === fractNo && chk.checked) {
      fractChecks.forEach((c) => {
        if (c !== fractNo) c.checked = false;
      });
    } else if (chk !== fractNo && chk.checked) {
      fractNo.checked = false;
    }
    actualizarFracturas();
  });
});

function actualizarFracturas() {
  const form = getActiveForm();
  if (!form) return;
  const seleccionadas = [];
  form.querySelectorAll(".fractura-check").forEach((chk) => {
    if (chk.checked) {
      if (chk.value === "otro") {
        const texto = form.querySelector("#fract_otro_text")?.value.trim();
        seleccionadas.push(texto ? `Otro: ${texto}` : "Otro");
      } else {
        seleccionadas.push(chk.value);
      }
    }
  });
  form.querySelector("#fract_previa").value = seleccionadas.join(",");
  calcularRiesgoTotal();
}

//logica de enfermedades asociadas
const enfChecks = document.querySelectorAll(".enf_asoc-check");
const enfNo = document.getElementById("enf_no");
const enfermedadesInput = document.getElementById("enfermedades_asociadas");
enfChecks.forEach((chk) => {
  chk.addEventListener("change", () => {
    if (chk === enfNo && chk.checked) {
      enfChecks.forEach((c) => {
        if (c !== enfNo) c.checked = false;
      });
    } else if (chk !== enfNo && chk.checked) {
      enfNo.checked = false;
    }
    actualizarEnfermedades();
  });
});

function actualizarEnfermedades() {
  const form = getActiveForm();
  if (!form) return;
  const seleccionadas = [];
  form.querySelectorAll(".enf_asoc-check").forEach((chk) => {
    if (chk.checked) {
      if (chk.value === "otro") {
        const texto = form.querySelector("#enf_otro_text")?.value.trim();
        seleccionadas.push(texto ? `Otro: ${texto}` : "Otro");
      } else {
        seleccionadas.push(chk.value);
      }
    }
  });
  form.querySelector("#enfermedades_asociadas").value = seleccionadas.join(",");
}

// Mostrar campos de texto para "otro" en fracturas y enfermedades
const fractOtroCheck = document.getElementById("fract_otro");
const fractOtroText = document.getElementById("fract_otro_text");

fractOtroCheck?.addEventListener("change", () => {
  if (fractOtroCheck.checked) {
    fractOtroText.classList.remove("d-none");
  } else {
    fractOtroText.classList.add("d-none");
    fractOtroText.value = "";
  }
});

const enfOtroCheck = document.getElementById("enf_otro");
const enfOtroText = document.getElementById("enf_otro_text");

enfOtroCheck?.addEventListener("change", () => {
  if (enfOtroCheck.checked) {
    enfOtroText.classList.remove("d-none");
  } else {
    enfOtroText.classList.add("d-none");
    enfOtroText.value = "";
  }
});

fractOtroText?.addEventListener("input", actualizarFracturas);
enfOtroText?.addEventListener("input", actualizarEnfermedades);

//recalcular campos dinamicos al editar
function recalcularCamposDependientes() {
  calcIMC();
  calcFraxMejorado();
  calcularRiesgoDMO();
}

//Cerrar tratamiendo sugerido si se modifican datos
document.addEventListener("input", function(e) {
  const form = e.target.closest("form");
  if (!form) return;
  cerrarTratamientoSiExiste();
});
document.addEventListener("change", function(e) {
  const form = e.target.closest("form");
  if (!form) return;
  cerrarTratamientoSiExiste();
});
function cerrarTratamientoSiExiste() {
  document
    .querySelectorAll(".resultado-tratamiento")
    .forEach((res) => res.remove());
}

// Control menopausia por sexo
function actualizarCampoMenopausia() {
  const sexo = getActiveField("sexo")?.value;
  const menopausiaField = getActiveField("menopausia");
  if (!menopausiaField) return;
  if (sexo === "Femenino") {
    menopausiaField.disabled = false;
    menopausiaField.closest(".col-md-2").style.opacity = "1";
  } else {
    menopausiaField.disabled = true;
    menopausiaField.value = "";
    menopausiaField.closest(".col-md-2").style.opacity = "0.5";
  }
}

document.addEventListener("change", (e) => {
  if (e.target.id === "sexo") actualizarCampoMenopausia();
});

//Reset de formulario: limpiar ventana y recalcular sliders
document.getElementById("osteoform")?.addEventListener("reset", () => {
  setTimeout(() => {
    limpiarResultadoTratamiento();
    document.querySelectorAll("#osteoform .t-score").forEach((s) => {
      updateTScoreText(s);
    });
    actualizarCampoMenopausia();
    calcFraxMejorado();
    calcularRiesgoDMO();
    calcularRiesgoTotal();
  }, 0);
});

// Eventos (mismo que antes, añade #previa etc.)
document.addEventListener("input", calcFraxMejorado);
document.addEventListener("change", calcFraxMejorado);
document.addEventListener("input", calcularRiesgoTotal);
document.addEventListener("change", calcularRiesgoTotal);
document.addEventListener("DOMContentLoaded", calcFraxMejorado);
document.addEventListener("DOMContentLoaded", actualizarCampoMenopausia);