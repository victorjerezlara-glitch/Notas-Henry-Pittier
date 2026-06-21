# ESTRATEGIA DE CORRECCIONES - EDGE FUNCTIONS

Fecha del análisis: 2026-06-21
Base de datos auditada: /supabase/02b_-_public_tables_schema.txt

## RESUMEN EJECUTIVO

Se encontraron **4 tablas problemáticas** que causan 51 referencias inválidas
en las edge functions:

| Tabla | Referencias | Archivos | Estado | Solución |
|---|---|---|---|---|
| `perfiles` | 12 | 8 | ❌ NO EXISTE | Reemplazar por `docentes` |
| `user_roles` | 31 | 25 | ❌ NO EXISTE | CREAR tabla o usar metadata |
| `secciones` | 5 | 3 | ❌ NO EXISTE | CREAR tabla o reemplazar |
| `rol` | 3 | 2 | ⚠️ METADATA | Usar metadata del auth |

## TABLAS VÁLIDAS EN LA BASE DE DATOS

Las siguientes tablas SÍ existen y están disponibles:

- `anios_escolares` - años escolares (id_anio, nombre, fecha_inicio, fecha_fin, activo)
- `asesores_seccion` - asesores de secciones (docente_id, seccion_id, anio_escolar_id)
- `audit_log` - registro de auditoría
- `calificaciones` - notas individuales
- `docente_materia_seccion` - asignación docente-materia-sección
- `docentes` - perfil de docentes (id, username, nombres, apellidos, activo)
- `estudiantes` - perfil de estudiantes (id_estudiante, cedula, nombres, apellidos)
- `evaluaciones` - evaluaciones creadas por docentes
- `evaluaciones_lapsos` - evaluaciones por lapso
- `evaluaciones_notas` - notas de evaluaciones
- `inscripciones` - inscripción estudiante-sección (estudiante_id, seccion_id, anio_escolar_id, estado)
- `lapsos` - períodos/lapsos escolares (anio_escolar_id, numero_lapso, fecha_inicio, fecha_fin)
- `materias` - catálogo de materias
- `notas_anuales` - notas finales por año
- `notas_lapso` - notas por lapso

## PROBLEMA 1: TABLA `perfiles` → SOLUCIÓN: `docentes`

**Archivos afectados (8):**
- users-create_user.txt
- users-delete_user.txt
- users-disable_user.txt
- users-enable_user.txt
- users-get_user.txt
- users-list_users.txt
- users-reset_password.txt
- users-update_user.txt

**Mapeo de columnas:**
```
perfiles.id          → docentes.id (UUID)
perfiles.username    → docentes.username
perfiles.nombres     → docentes.nombres
perfiles.apellidos   → docentes.apellidos
perfiles.cedula      → NO EXISTE en docentes (agregar campo)
perfiles.activo      → docentes.activo
```

**Acción recomendada:** Reemplazar `from("perfiles")` con `from("docentes")`
⚠️ **NOTA:** La tabla `docentes` no tiene campo `cedula`. Considere agregarlo o
almacenar en metadatos de auth.

## PROBLEMA 2: TABLA `user_roles` → SOLUCIÓN: CREAR o REVISAR LÓGICA

**Archivos afectados (25):**
- periodos-*.txt (6 archivos)
- secciones-*.txt (11 archivos)
- users-*.txt (8 archivos)

**Propósito:** Almacenar relación de usuarios con sus roles
(Docente, Control de Estudios, Evaluador, Directivo, Superadmin)

**Opciones:**

### Opción A: Crear tabla `user_roles`
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id_rol INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Opción B: Usar metadata de auth.users
El rol podría almacenarse como metadata en `auth.users.user_metadata`
y recuperarse con `supabaseAdmin.auth.getUser(token)`

## PROBLEMA 3: TABLA `secciones` → SOLUCIÓN: CREAR o REVISAR

**Archivos afectados (3):**
- cambiar-seccion.txt
- inscribir-estudiante.txt
- repetir-grado.txt

**Propósito probable:** Almacenar información de secciones/grupos escolares
(grado, paralelo, periodo, etc.)

**Opciones:**

### Opción A: Crear tabla `secciones`
```sql
CREATE TABLE secciones (
  id_seccion SERIAL PRIMARY KEY,
  anio_escolar_id INTEGER REFERENCES anios_escolares(id_anio),
  grado_id INTEGER,
  paralelo VARCHAR(1),
  descripcion VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Opción B: Revisar lógica existente
Las secciones podrían relacionarse indirectamente a través de:
- `inscripciones` (estudiante-sección-año)
- `docente_materia_seccion` (docente-materia-sección-año)

## PROBLEMA 4: REFERENCIA A `rol` → SOLUCIÓN: REVISAR LÓGICA

**Archivos afectados (2):**
- users-get_user.txt (line ~)
- users-list_users.txt (line ~)

**Propósito:** Recuperar información del rol del usuario

**Opciones:

### Opción A: Usar metadatos de auth
```typescript
const { data: { user } } = await supabaseAdmin.auth.getUser(token);
const rol = user?.user_metadata?.role;
```

### Opción B: Consultar tabla `user_roles` si existe
```typescript
const { data: userRole } = await supabaseAdmin
  .from('user_roles')
  .select('id_rol')
  .eq('user_id', userId)
  .single();
```

## RESUMEN DE ACCIONES REQUERIDAS

### INMEDIATAS (BLOQUEANTES)
1. ✅ Decidir si crear tabla `user_roles` o usar metadata de auth
2. ✅ Decidir si crear tabla `secciones` o revisar lógica
3. ✅ Reemplazar `perfiles` por `docentes` en 8 archivos

### SECUNDARIAS
4. Actualizar edge functions según decisiones de #1 y #2
5. Validar que todas las referencias a columnas existan
6. Pruebas de integración con la base de datos
