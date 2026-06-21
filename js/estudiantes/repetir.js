async function abrirRepetirGrado(id_inscripcion, seccion_id, anio_escolar_id) {
  const inputId = document.getElementById("repetirIdInscripcion");
  const selectSeccion = document.getElementById("repetirSeccion");

  inputId.value = id_inscripcion;

  // Obtener la sección actual para saber el grado
  const { data: secActual } = await supabase
    .from("secciones")
    .select("grado_id")
    .eq("id_seccion", seccion_id)
    .single();

  // Cargar secciones del mismo grado
  const { data: secciones } = await supabase
    .from("secciones")
    .select("*")
    .eq("grado_id", secActual.grado_id);

  selectSeccion.innerHTML = secciones
    .map(s => `<option value="${s.id_seccion}">${s.nombre}</option>`)
    .join("");

  new bootstrap.Modal("#modalRepetirGrado").show();
}


document.getElementById("btnConfirmarRepetir").addEventListener("click", async (event) => {
  const btn = event.target;

  const id_inscripcion = document.getElementById("repetirIdInscripcion").value;
  const nueva_seccion = document.getElementById("repetirSeccion").value;

  if (!nueva_seccion) {
    alert("Debe seleccionar una sección");
    return;
  }

  btn.disabled = true;

  try {
    const res = await fetch("/functions/v1/repetir-grado", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window._session.access_token}`
      },
      body: JSON.stringify({
        id_inscripcion,
        nueva_seccion
      })
    });

    const data = await res.json();

    if (!data.ok) {
      alert("Error: " + data.error);
      return;
    }

    bootstrap.Modal.getInstance("#modalRepetirGrado").hide();
    await cargarEstudiantes();
    await abrirDetallesEstudiante(data.id_estudiante);

  } finally {
    btn.disabled = false;
  }
});
