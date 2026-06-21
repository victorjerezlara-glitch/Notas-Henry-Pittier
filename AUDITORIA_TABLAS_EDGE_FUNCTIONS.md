# AUDITORÍA DE TABLAS EN EDGE FUNCTIONS

## Problemas Encontrados

Se detectaron **4 tablas no autorizadas** en las edge functions:

### `perfiles`
- **Referencias encontradas:** 12
- **Archivos afectados:** 8
  - users-create_user.txt
  - users-delete_user.txt
  - users-disable_user.txt
  - users-enable_user.txt
  - users-get_user.txt
  - users-list_users.txt
  - users-reset_password.txt
  - users-update_user.txt

### `rol`
- **Referencias encontradas:** 3
- **Archivos afectados:** 2
  - users-get_user.txt
  - users-list_users.txt

### `secciones`
- **Referencias encontradas:** 5
- **Archivos afectados:** 3
  - cambiar-seccion.txt
  - inscribir-estudiante.txt
  - repetir-grado.txt

### `user_roles`
- **Referencias encontradas:** 31
- **Archivos afectados:** 25
  - periodos-activate_lapso.txt
  - periodos-close_anio.txt
  - periodos-close_lapso.txt
  - periodos-create_anio.txt
  - periodos-create_lapso.txt
  - secciones-agregar-materia.txt
  - secciones-asignar-docente.txt
  - secciones-cambiar-docente.txt
  - secciones-clonar-otro-anio.txt
  - secciones-clonar.txt
  - ... y 15 más

## Análisis y Soluciones Propuestas

| Tabla Inválida | Tabla Correcta | Descripción | Acción |
|---|---|---|---|
| `perfiles` | `docentes` | Almacena perfiles de usuarios (docentes, directivos) | REEMPLAZAR |
| `rol` | N/A (metadata) | No es una tabla, es metadata del usuario en `auth.users` | REVISAR lógica |
| `secciones` | FALTA CREAR | Tabla que asocia grados, paralelos y periodos escolares | CREAR o REVISAR |
| `user_roles` | FALTA CREAR | Tabla para asignar roles a usuarios (relación muchos-a-muchos) | CREAR o REVISAR |

## Esquema Actual (Tablas Disponibles)

- `anios_escolares` - años escolares
- `asesores_seccion` - asesores por sección
- `audit_log` - auditoría de cambios
- `calificaciones` - calificaciones de estudiantes
- `docente_materia_seccion` - asignación de docentes a materias/secciones
- `docentes` - información de docentes
- `estudiantes` - información de estudiantes
- `evaluaciones` - evaluaciones creadas
- `evaluaciones_lapsos` - evaluaciones por lapso
- `evaluaciones_notas` - notas de evaluaciones
- `inscripciones` - inscripción de estudiantes en secciones
- `lapsos` - períodos/lapsos escolares
- `materias` - catálogo de materias
- `notas_anuales` - notas finales por año
- `notas_lapso` - notas por lapso
