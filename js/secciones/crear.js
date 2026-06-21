async function crearSeccion(event) {
  const btn = event.target;
  btn.disabled = true;

  const error = validarCrear();
  if (error) {
    alert(error);
    btn.disabled = false;
    return;
  }

  const body = {
    nombre: document.getElementById("crearNombre").value,
    grado: Number(document.getElementById("crearGrado").value),
    letra: document.getElementById("crearLetra").value,
    anio_escolar_id: Number(document.getElementById("crearAnio").value)
  };

  try {
    const res = await fetch("/functions/v1/secciones-crear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.error) {
      alert("Error: " + data.error);
      return;
    }

    cargarSecciones();

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalCrear"));
    modal.hide();

  } finally {
    btn.disabled = false;
  }
}

