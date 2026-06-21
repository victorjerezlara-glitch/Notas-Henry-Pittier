async function retirarEstudiante(id_inscripcion) {
  const confirmar = await confirmarAccion("¿Retirar estudiante?");
  if (!confirmar) return;

  const res = await fetch("/functions/v1/retirar-estudiante", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window._session.access_token}`
    },
    body: JSON.stringify({ id_inscripcion })
  });

  const data = await res.json();

  if (!data.ok) {
    alert("Error: " + data.error);
    return;
  }

  await cargarEstudiantes();
}
