// ===============================
// DECISIÓN TERAPÉUTICA OSTEOPOROSIS
// ===============================

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-decision');
    if (!btn) return;

    const form = btn.closest('form');
    if (!form) return;

    const data = recogerDatosFormulario(form);
    const resultado = decidirTratamiento(data);
    mostrarResultado(resultado);
});

// -------------------------------
// Recoger datos relevantes
// -------------------------------
function recogerDatosFormulario(form) {
  const sexo = form.querySelector('#sexo')?.value;
  const edad = Number(form.querySelector('#edad')?.value);
  const fracturas = form.querySelectorAll('#fracturasList .alert').length;
  const tLumbar = Number(form.querySelector('#t_lumbar')?.value);
  const tCuello = Number(form.querySelector('#t_cuello')?.value);
  const riesgoFRAX = Number(form.querySelector('#riesgo_frax')?.value);
  const riesgoDMO = form.querySelector('#riesgo_dmo')?.value?.toLowerCase();
  const corticoides = form.querySelector('#corticoides')?.value;

  return {
    sexo,
    edad,
    fracturas,
    tLumbar,
    tCuello,
    riesgoFRAX,
    riesgoDMO,
    tratActual,
    corticoides
  };
}


// -------------------------------
// LÓGICA DE DECISIÓN (core)
// -------------------------------
function decidirTratamiento(p) {

  // 0️⃣ SIN DATOS CLAVE
  if (!p.sexo || !p.edad) {
    return 'Faltan datos básicos para la toma de decisiones clínicas.';
  }

  // 1️⃣ FRACTURA DE CADERA → TRATAMIENTO DIRECTO
  if (p.fracturas > 0) {
    return `
Paciente con fractura osteoporótica previa.

✔ Medidas universales: calcio + vitamina D  
✔ Prevención de caídas  
✔ Tratamiento farmacológico de primera línea:

➡ Bifosfonato (oral o IV según tolerancia)

⚠ Considerar denosumab o teriparatida si riesgo muy alto.
    `;
  }

  // 2️⃣ MUY ALTO RIESGO
  if (
    p.fracturas >= 2 ||
    p.riesgoDMO === 'muy alto'
  ) {
    return `
Paciente con riesgo MUY ALTO de fractura.

➡ Tratamiento recomendado:
✔ Teriparatida (1-34 PTH) durante 24 meses  
➡ Posteriormente bifosfonato o denosumab.
    `;
  }

  // 3️⃣ ALTO RIESGO
  if (
    p.riesgoFRAX >= 20 ||
    p.tLumbar <= -2.5 ||
    p.tCuello <= -2.5 ||
    p.riesgoDMO === 'alto'
  ) {
    return `
Paciente con ALTO riesgo de fractura.

➡ Tratamiento recomendado:
✔ Bifosfonato oral (alendronato / risedronato)

🔄 Reevaluar en 3–5 años con FRAX y DMO.
    `;
  }

  // 4️⃣ RIESGO MODERADO
  if (p.riesgoFRAX >= 10 || p.riesgoDMO === 'moderado') {
    return `
Paciente con riesgo MODERADO.

✔ Medidas no farmacológicas
✔ Calcio + Vitamina D
🔄 Reevaluar FRAX + DMO periódicamente
    `;
  }

  // 5️⃣ BAJO RIESGO
  return `
Paciente de BAJO riesgo de fractura.

❌ No se indica tratamiento farmacológico
✔ Medidas higiénico-dietéticas
✔ Prevención de caídas
✔ Seguimiento clínico
  `;
}

// -------------------------------
// Mostrar resultado
// -------------------------------
function mostrarResultado(texto) {
  alert(`RESULTADO DE LA EVALUACIÓN\n\n${texto}`);
}
