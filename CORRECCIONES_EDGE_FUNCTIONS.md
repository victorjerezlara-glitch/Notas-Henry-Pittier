# Auditoría de Supabase Edge Functions

Ruta auditada: `supabase/edge_functions/*.txt`

- Total de funciones revisadas: 36

## Resultados de la auditoría

- deprecated_env: 0 archivos
- jwt_secret: 0 archivos
- verify_jwt: 0 archivos
- legacy_create: 0 archivos
- direct_secret: 34 archivos
  - cambiar-seccion.txt
  - inscribir-estudiante.txt
  - listar-estudiantes.txt
  - periodos-activate_lapso.txt
  - periodos-close_anio.txt
  - periodos-close_lapso.txt
  - periodos-create_anio.txt
  - periodos-create_lapso.txt
  - periodos-get_activo.txt
  - periodos-list_anios.txt
  - periodos-list_lapsos.txt
  - promover-estudiante.txt
  - repetir-grado.txt
  - retirar-estudiante.txt
  - secciones-agregar-materia.txt
  - secciones-asignar-docente.txt
  - secciones-cambiar-docente.txt
  - secciones-clonar-otro-anio.txt
  - secciones-clonar.txt
  - secciones-crear.txt
  - secciones-editar.txt
  - secciones-listar-materias.txt
  - secciones-listar.txt
  - secciones-quitar-materia.txt
  - secciones-toggle.txt
  - users-change_email.txt
  - users-create_user.txt
  - users-delete_user.txt
  - users-disable_user.txt
  - users-enable_user.txt
  - users-get_user.txt
  - users-list_users.txt
  - users-reset_password.txt
  - users-update_user.txt

## Observaciones

- No se detectaron referencias a `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` ni `verifyJWT` en los archivos auditados.
- Las funciones que usan `SUPABASE_SECRET_KEYS` lo hacen dentro del helper `getServiceRoleKey()` que parsea la variable para extraer una clave de servicio.
- La presencia de `Deno.env.get("SUPABASE_SECRET_KEYS")` en 34 archivos es esperada si el helper se define localmente en cada función.
- Se recomienda validar en el entorno de Supabase el formato exacto de `SUPABASE_SECRET_KEYS` y confirmar que la clave de servicio esté presente en el JSON retornado.
- Si se desea evitar duplicación, se puede unificar `getServiceRoleKey()` en un archivo compartido o plantilla de despliegue.
