let tokenGlobal = null;

// -------------------------------------------------------------
// Cargar módulo de usuarios
// -------------------------------------------------------------
async function cargarModuloUsuarios(token) {
  tokenGlobal = token;

  document.getElementById("tituloModulo").textContent = "Gestión de Usuarios";

  document.getElementById("moduloContenido").innerHTML = `
    <div class="d-flex justify-content-between mb-3">
      <h4>Usuarios registrados</h4>
      <button class="btn btn-primary" onclick="abrirModalCrear()">+ Crear usuario</button>
    </div>

    <div class="row mb-3">
      <div class="col-md-3">
        <input id="searchInput" class="form-control" placeholder="Buscar..." />
      </div>

      <div class="col-md-3">
        <select id="rolFilter" class="form-select">
          <option value="">Filtrar por rol</option>
          <option value="docente">Docente</option>
          <option value="control_estudios">Control de Estudios</option>
          <option value="evaluacion_docente">Evaluación Docente</option>
          <option value="directivo">Directivo</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>

      <div class="col-md-3">
        <select id="activoFilter" class="form-select">
          <option value="">Estado</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>

      <div class="col-md-3">
        <button class="btn btn-secondary w-100" onclick="cargarTablaUsuarios(1)">Aplicar filtros</button>
      </div>
    </div>

    <div id="tablaUsuarios"></div>

    <!-- Modal Crear/Editar -->
    <div class="modal fade" id="modalUsuario" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="modalTitulo" class="modal-title"></h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <form id="formUsuario">

              <input type="hidden" id="userId">

              <div class="mb-3">
                <label>Email</label>
                <input id="email" class="form-control" required>
              </div>

              <div class="mb-3">
                <label>Nombres</label>
                <input id="nombres" class="form-control">
              </div>

              <div class="mb-3">
                <label>Apellidos</label>
                <input id="apellidos" class="form-control">
              </div>

              <div class="mb-3">
                <label>Cédula</label>
                <input id="cedula" class="form-control" required>
              </div>

              <div class="mb-3">
                <label>Teléfono</label>
                <input id="telefono" class="form-control">
              </div>

              <div class="mb-3">
                <label>Rol</label>
                <select id="rol" class="form-select" required>
                  <option value="docente">Docente</option>
                  <option value="control_estudios">Control de Estudios</option>
                  <option value="evaluacion_docente">Evaluación Docente</option>
                  <option value="directivo">Directivo</option>
                </select>
              </div>

              <div class="mb-3" id="especialidadGroup" style="display:none;">
                <label>Especialidad (solo docentes)</label>
                <input id="especialidad" class="form-control">
              </div>

              <div class="mb-3" id="passwordGroup">
                <label>Contraseña</label>
                <input id="password" type="password" class="form-control">
              </div>

            </form>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" onclick="guardarUsuario()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  cargarTablaUsuarios(1);
}

// -------------------------------------------------------------
// Cargar tabla de usuarios
// -------------------------------------------------------------
async function cargarTablaUsuarios(page = 1) {
  const search = document.getElementById("searchInput").value.trim();
  const rolFilter = document.getElementById("rolFilter").value;
  const activoFilter = document.getElementById("activoFilter").value;

  const body = { page, per_page: 10 };

  if (search) body.search = search;
  if (rolFilter) body.rol_filter = rolFilter;
  if (activoFilter) body.activo_filter = activoFilter === "true";

  const { data, error } = await supabase.functions.invoke(
    "users-list_users",
    {
      body,
      headers: { Authorization: `Bearer ${tokenGlobal}` }
    }
  );

  if (error) {
    document.getElementById("tablaUsuarios").innerHTML =
      `<div class="alert alert-danger">Error cargando usuarios</div>`;
    return;
  }

  const usuarios = data.data;
  const pag = data.pagination;

  let html = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Cédula</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  usuarios.forEach(u => {
    html += `
      <tr>
        <td>${u.cedula}</td>
        <td>${u.nombres} ${u.apellidos}</td>
        <td>${u.email}</td>
        <td>${u.rol}</td>
        <td>${u.activo ? "Activo" : "Inactivo"}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarUsuario('${u.id}')">Editar</button>
          ${
            u.activo
              ? `<button class="btn btn-sm btn-danger" onclick="desactivarUsuario('${u.id}')">Desactivar</button>`
              : `<button class="btn btn-sm btn-success" onclick="activarUsuario('${u.id}')">Activar</button>`
          }
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  // Paginación
  html += `
    <nav>
      <ul class="pagination">
  `;

  for (let i = 1; i <= pag.pages; i++) {
    html += `
      <li class="page-item ${i === pag.page ? "active" : ""}">
        <a class="page-link" onclick="cargarTablaUsuarios(${i})">${i}</a>
      </li>
    `;
  }

  html += `
      </ul>
    </nav>
  `;

  document.getElementById("tablaUsuarios").innerHTML = html;
}

// -------------------------------------------------------------
// Crear usuario
// -------------------------------------------------------------
function abrirModalCrear() {
  document.getElementById("modalTitulo").textContent = "Crear Usuario";
  document.getElementById("formUsuario").reset();
  document.getElementById("userId").value = "";
  document.getElementById("passwordGroup").style.display = "block";
  new bootstrap.Modal(document.getElementById("modalUsuario")).show();
}

// -------------------------------------------------------------
// Editar usuario
// -------------------------------------------------------------
async function editarUsuario(id) {
  const { data, error } = await supabase.functions.invoke(
    "users-get_user",
    {
      body: { user_id: id },
      headers: { Authorization: `Bearer ${tokenGlobal}` }
    }
  );

  if (error) return alert("Error cargando usuario");

  document.getElementById("modalTitulo").textContent = "Editar Usuario";

  document.getElementById("userId").value = id;
  document.getElementById("email").value = data.email;
  document.getElementById("nombres").value = data.nombres;
  document.getElementById("apellidos").value = data.apellidos;
  document.getElementById("cedula").value = data.cedula;
  document.getElementById("telefono").value = data.telefono;
  document.getElementById("rol").value = data.rol;
  document.getElementById("especialidad").value = data.especialidad || "";

  document.getElementById("passwordGroup").style.display = "none";

  new bootstrap.Modal(document.getElementById("modalUsuario")).show();
}

// -------------------------------------------------------------
// Guardar usuario (crear o editar)
// -------------------------------------------------------------
async function guardarUsuario() {
  const id = document.getElementById("userId").value;

  const payload = {
    email: document.getElementById("email").value.trim(),
    nombres: document.getElementById("nombres").value.trim(),
    apellidos: document.getElementById("apellidos").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    rol: document.getElementById("rol").value,
    especialidad: document.getElementById("especialidad").value.trim()
  };

  if (!id) {
    payload.password = document.getElementById("password").value.trim();

    await supabase.functions.invoke("users-create_user", {
      body: payload,
      headers: { Authorization: `Bearer ${tokenGlobal}` }
    });
  } else {
    payload.user_id = id;

    await supabase.functions.invoke("users-update_user", {
      body: payload,
      headers: { Authorization: `Bearer ${tokenGlobal}` }
    });
  }

  bootstrap.Modal.getInstance(document.getElementById("modalUsuario")).hide();
  cargarTablaUsuarios(1);
}

// -------------------------------------------------------------
// Activar / Desactivar
// -------------------------------------------------------------
async function desactivarUsuario(id) {
  await supabase.functions.invoke("users-disable_user", {
    body: { user_id: id },
    headers: { Authorization: `Bearer ${tokenGlobal}` }
  });
  cargarTablaUsuarios(1);
}

async function activarUsuario(id) {
  await supabase.functions.invoke("users-enable_user", {
    body: { user_id: id },
    headers: { Authorization: `Bearer ${tokenGlobal}` }
  });
  cargarTablaUsuarios(1);
}
