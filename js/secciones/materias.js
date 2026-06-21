
async function abrirMaterias(idSeccion) {
  limpiarErrores(); // ← IMPORTANTE

  const sec = window._secciones.find(s => s.id_seccion === idSeccion);
  window._materiasSeccionSeccionId = idSeccion;
  if (!sec) return;
  
  document.getElementById("materiasInfoSeccion").innerText =
    `${sec.nombre} — ${sec.grado}° ${sec.letra}`;

  const res = await fetch(`/functions/v1/secciones-listar-materias?id_seccion=${idSeccion}`, {
    headers: { Authorization: `Bearer ${session.access_token}` }
  });

  const data = await res.json();
  window._materiasSeccion = data;

  const tbody = document.getElementById("tablaMateriasSeccion");
  tbody.innerHTML = "";

  data.forEach(m => {
    tbody.innerHTML += `
      <tr>
        <td>${m.nombre_materia}</td>
        <td>${m.docente_nombre ?? "<span class='text-muted'>Sin docente</span>"}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="abrirAsignarDocente(${sec.id_seccion}, ${m.id_materia})">
            Asignar / cambiar docente
          </button>

          <button class="btn btn-sm btn-outline-danger" onclick="quitarMateria(${sec.id_seccion}, ${m.id_materia})">
            Quitar materia
          </button>
        </td>
      </tr>
    `;
  });

  new bootstrap.Modal(document.getElementById("modalMaterias")).show();
}


function quitarMateria(idSeccion, idMateria) {
  confirmarAccion(
    "¿Seguro que deseas quitar esta materia de la sección?",
    async () => {
      const res = await fetch("/functions/v1/secciones-quitar-materia", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id_seccion: idSeccion, id_materia: idMateria })
      });

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
        return;
      }

      abrirMaterias(idSeccion);
    }
  );
}
