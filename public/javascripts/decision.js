// ===============================
// Lógica del tratamiento sugerido basada en datos del formulario
// ===============================

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-decision");
  if (!btn) return;

  const form = btn.closest("form");
  if (!form) return;

  const data = recogerDatosFormulario(form);
  const resultado = decidirTratamiento(data);
  mostrarResultado(resultado, btn);
});

// -------------------------------
// Recoger datos relevantes
// -------------------------------
function recogerDatosFormulario(form) {
  const sexo = form.querySelector("#sexo")?.value;
  const edad = Number(form.querySelector("#edad")?.value);

  const tLumbar = Number(form.querySelector("#t_lumbar")?.value);
  const tCuello = Number(form.querySelector("#t_cuello")?.value);

  const peorTScore = Math.min(tLumbar, tCuello);

  const riesgoFRAX = Number(form.querySelector("#riesgo_frax")?.value);
  const riesgoDMO = form.querySelector("#riesgo_dmo")?.value;
  const riesgoTotal = form.querySelector("#riesgo_total")?.value;

  const fracturasPrevias = form.querySelector("#fract_previa")?.value || "";

  const corticoides = form.querySelector("#corticoides")?.value;
  const calcio = Number(form.querySelector("#calcio")?.value);
  const aclaramiento = Number(
    form.querySelector("#aclaramiento_creatinina")?.value,
  );

  const enfAsociadas = form.querySelector("#enfermedades_asociadas")?.value || "";
  const oncologicas = form.querySelector("#oncologicas")?.value || "";

  const bifosfonatos = form.querySelector("#bifosfonatos")?.value;
  const denosumab = form.querySelector("#denosumab")?.value;
  const anabolicos = form.querySelector("#anabolicos")?.value;

  return {
    sexo,
    edad,
    tLumbar,
    tCuello,
    peorTScore,
    riesgoFRAX,
    riesgoDMO,
    riesgoTotal,
    fracturasPrevias,
    corticoides,
    calcio,
    aclaramiento,
    enfAsociadas,
    bifosfonatos,
    denosumab,
    anabolicos,
    enfAsociadas,
    oncologicas
  };
}

// -------------------------------
// LÓGICA DE DECISIÓN (core)
// -------------------------------
function decidirTratamiento(p) {
  let recomendaciones = [];

  // 1. Clasificación base
  let riesgo = "bajo";
  if (p.peorTScore >= -1) {
    riesgo = "bajo";
  } else if (p.peorTScore >= -2.5) {
    riesgo = "moderado";
  } else if (p.peorTScore >= -3.5) {
    riesgo = "alto";
  } else {
    riesgo = "muy alto";
  }

  // aumentar riesgo si hay fracturas o corticoides
  if (p.fracturasPrevias && p.fracturasPrevias !== "no") {
    if (riesgo === "bajo") riesgo = "moderado";
    else if (riesgo === "moderado") riesgo = "alto";
    else riesgo = "muy alto";
  }

  if (p.corticoides === "si") {
    if (riesgo === "moderado") riesgo = "alto";
    else if (riesgo === "alto") riesgo = "muy alto";
  }

  // 2. base universal
  recomendaciones.push("Valorar ingesta adecuada de calcio");
  recomendaciones.push("Asegurar niveles adecuados de vitamina D");
  recomendaciones.push("Ejercicio de fuerza y prevención de caídas");

  // 3. decisiones terapéuticas

  if (riesgo === "bajo") {
    recomendaciones.push(
      "No se recomienda tratamiento farmacológico específico",
    );
  } else if (riesgo === "moderado") {
    recomendaciones.push(
      "Suplementación con calcio y vitamina D si ingesta insuficiente",
    );
  } else if (riesgo === "alto") {
    if (p.aclaramiento < 35) {
      recomendaciones.push("Evitar bifosfonatos por insuficiencia renal");
      recomendaciones.push("Considerar Denosumab");
    } else {
      recomendaciones.push("Primera línea: Alendronato");
      recomendaciones.push("Alternativas: Risedronato o Zoledronato");
    }
  } else if (riesgo === "muy alto") {
    if (p.sexo === "Femenino" && !p.enfAsociadas.includes("cardiaca")) {
      recomendaciones.push("Considerar Romosozumab durante 12 meses");
    } else {
      recomendaciones.push("Considerar Teriparatida hasta 24 meses");
    }

    recomendaciones.push(
      "Tras tratamiento anabólico, continuar con antiresortivo",
    );
  }

  // 4. advertencias por tratamientos previos

  if (p.denosumab === "si") {
    recomendaciones.push("No suspender Denosumab sin terapia alternativa");
  }

  if (p.anabolicos.includes("Teriparatida") && p.denosumab === "si") {
    recomendaciones.push("Evitar cambio directo Denosumab → Teriparatida");
  }

  //5. BANDERAS ROJAS
  if (p.enfAsociadas.includes("oncologicas") || p.oncologicas === "si") {
    recomendaciones.push("CONTRAINDICADO: No usar Teriparatida en pacientes con antecedentes oncológicos");
  }

  if (p.enfAsociadas.includes("cardiaca")) {
    recomendaciones.push("CONTRAINDICADO: No usar Romosozumab en pacientes con enfermedad cardíaca");
  }

  return {
    riesgo,
    recomendaciones,
  };
}

// -------------------------------
// Mostrar resultado
// -------------------------------
function mostrarResultado(resultado, btn) {
  // Navegar hasta el .d-flex exterior (el que tiene limpiar + botones derecha)
  const innerFlex = btn.closest(".d-flex"); // div con ms-auto
  const outerFlex = innerFlex.parentElement; // d-flex exterior
  const limpiarBtn = outerFlex.querySelector('[type="reset"]');

  const colores = {
    bajo: { clase: "alert-success" },
    moderado: { clase: "alert-warning" },
    alto: { clase: "alert-danger" },
    "muy alto": { clase: "alert-danger" },
  };
  const c = colores[resultado.riesgo] || colores["bajo"];

  // Reutilizar si ya existe, si no crear
  let contenedor = outerFlex.querySelector(".resultado-tratamiento");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.className = `alert ${c.clase} resultado-tratamiento mb-0`;
    contenedor.style.cssText =
      "flex:1; margin:0 1rem; position:relative; font-size:0.875rem;";
    // Insertar justo después del botón limpiar, antes de los botones derecha
    limpiarBtn.insertAdjacentElement("afterend", contenedor);
  } else {
    // Actualizar color si el riesgo cambió
    contenedor.className = `alert ${c.clase} resultado-tratamiento mb-0`;
  }

  contenedor.innerHTML = `
    <!-- Botón cerrar -->
    <button type="button" class="btn-cerrar-resultado" style="
      position:absolute; top:0.3rem; right:0.5rem;
      background:none; border:none; font-size:1.1rem;
      cursor:pointer; opacity:0.6; line-height:1;"
      aria-label="Cerrar">&times;</button>

    <strong>Riesgo: ${resultado.riesgo.toUpperCase()}</strong>
    <ul class="mb-0 mt-1 ps-3">
      ${resultado.recomendaciones.map((r) => `<li>${r}</li>`).join("")}
    </ul>
  `;

  // Listener del botón cerrar
  contenedor
    .querySelector(".btn-cerrar-resultado")
    .addEventListener("click", () => contenedor.remove());
}

// ===============================
// Limpiar resultado previo
// ===============================
function limpiarResultadoTratamiento() {
  document
    .querySelectorAll(".resultado-tratamiento")
    .forEach((el) => el.remove());
}
