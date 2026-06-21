// Cargar años escolares en los selects


async function cargarAniosEscolares() {
  const res = await fetch("/functions/v1/periodos-list_anios", {
    headers: { Authorization: `Bearer ${session?.access_token}` }
  });

  if (!res.ok) {
    console.error("Error al cargar años escolares");
    return;
  }

  const json = await res.json();
  const data = json.data || [];

  const selects = [
    document.getElementById("filtroAnio"),
    document.getElementById("crearAnio"),
    document.getElementById("editarAnio")
  ];

  selects.forEach(sel => {
    sel.innerHTML = "";
    data.forEach(a => {
      sel.innerHTML += `<option value="${a.id_anio}">${a.nombre}</option>`;
    });
  });
}

// Cargar secciones
async function cargarSecciones() {
  const anio = document.getElementById("filtroAnio").value;

  const res = await fetch(`/functions/v1/secciones-listar?anio_escolar_id=${anio}`, {
    headers: { Authorization: `Bearer ${session?.access_token}` }
  });

  if (!res.ok) {
    console.error("Error al cargar secciones");
    return;
  }

  const data = await res.json();

  // Guardar en memoria
  window._secciones = data;
window._seccionesFiltradas = [...data]; // copia para búsqueda/orden/paginación
renderizarTabla();


  const tbody = document.getElementById("tablaSecciones");
  tbody.innerHTML = "";

  data.forEach(sec => {
    tbody.innerHTML += `
      <tr>
        <td>${sec.nombre}</td>
        <td>${sec.grado}</td>
        <td>${sec.letra}</td>
        <td>
          <span class="badge ${sec.activo ? "bg-success" : "bg-danger"}">
            ${sec.activo ? "Activa" : "Inactiva"}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-info" onclick="abrirMaterias(${sec.id_seccion})">
            Materias
          </button>

          <button class="btn btn-sm btn-warning" onclick="abrirEditar(${sec.id_seccion})">
            Editar
          </button>

          <button class="btn btn-sm btn-secondary" onclick="abrirClonar(${sec.id_seccion})">
            Clonar
          </button>

          <button class="btn btn-sm btn-dark" onclick="toggleSeccion(${sec.id_seccion})">
            ${sec.activo ? "Desactivar" : "Activar"}
          </button>
        </td>
      </tr>
    `;
  });
}

function renderizarTabla() {
  const tbody = document.getElementById("tablaSecciones");
  tbody.innerHTML = "";

  const inicio = (window._paginaActual - 1) * window._tamanoPagina;
  const fin = inicio + window._tamanoPagina;

  const pagina = window._seccionesFiltradas.slice(inicio, fin);

  pagina.forEach(sec => {
    tbody.innerHTML += `
      <tr>
        <td>${sec.nombre}</td>
        <td>${sec.grado}</td>
        <td>${sec.letra}</td>
        <td>
          <span class="badge ${sec.activo ? "bg-success" : "bg-danger"}">
            ${sec.activo ? "Activa" : "Inactiva"}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-info" onclick="abrirMaterias(${sec.id_seccion})">Materias</button>
          <button class="btn btn-sm btn-warning" onclick="abrirEditar(${sec.id_seccion})">Editar</button>
          <button class="btn btn-sm btn-secondary" onclick="abrirClonar(${sec.id_seccion})">Clonar</button>
          <button class="btn btn-sm btn-dark" onclick="toggleSeccion(${sec.id_seccion})">
            ${sec.activo ? "Desactivar" : "Activar"}
          </button>
        </td>
      </tr>
    `;
  });

  renderizarPaginacion(window._seccionesFiltradas.length);
}
