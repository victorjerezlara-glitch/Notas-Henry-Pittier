# Edge Functions Fix Plan

## Status: AWAITING USER CONFIRMATION

### ⚠️ ACTION REQUIRED FROM USER

**Question:** Which is your correct Supabase service role environment variable?

Check your Supabase project:
1. Go to **Project Settings > API**
2. Look for "service_role" key name - it should be either:
   - `SUPABASE_SERVICE_ROLE_KEY` (current standard)
   - `SUPABASE_SERVICE_ROLE` 
   - `SERVICE_ROLE`

Also export your public schema with this SQL:
```sql
SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

---

## Issues Found & Fixes Needed

### Issue 1: Environment Variable Inconsistency (28 files)

**Problem:** 3 different env var names used across edge functions
- `SERVICE_ROLE` in 34 files
- `SUPABASE_SERVICE_ROLE` in 32 files
- `SUPABASE_SERVICE_ROLE_KEY` in 17 files

**Solution:** Normalize to **ONE** variable name (pending user confirmation)

**Files to fix:**
```
cambiar-seccion.txt
inscribir-estudiante.txt
listar-estudiantes.txt
periodos-activate_lapso.txt
periodos-close_anio.txt
periodos-close_lapso.txt
periodos-create_anio.txt
periodos-create_lapso.txt
periodos-get_activo.txt
periodos-list_anios.txt
periodos-list_lapsos.txt
promover-estudiante.txt
repetir-grado.txt
retirar-estudiante.txt
secciones-agregar-materia.txt
secciones-asignar-docente.txt
secciones-cambiar-docente.txt
secciones-clonar-otro-anio.txt
secciones-clonar.txt
secciones-crear.txt
secciones-editar.txt
secciones-listar-materias.txt
secciones-listar.txt
secciones-quitar-materia.txt
users-create_user.txt
users-delete_user.txt
users-update_user.txt
```

### Issue 2: Unsafe .single() Calls (2 files - CRITICAL)

**Problem:** `.single()` used without error checking before property access

#### File: `repetir-grado.txt` (Line ~69)
```typescript
// BROKEN:
const { data: secActual } = await supabase
  .from("secciones")
  .select("grado_id")
  .eq("id_seccion", insc.seccion_id)
  .single();

if (secNueva.grado_id !== secActual.grado_id) {  // ❌ secActual might be null!
```

**Fix:**
```typescript
// FIXED:
const { data: secActual, error: errSecActual } = await supabase
  .from("secciones")
  .select("grado_id")
  .eq("id_seccion", insc.seccion_id)
  .single();

if (errSecActual || !secActual) {
  return new Response(
    JSON.stringify({ ok: false, error: "La sección actual no existe." }),
    { status: 400 }
  );
}

if (secNueva.grado_id !== secActual.grado_id) {  // ✅ Now safe
```

#### File: `cambiar-seccion.txt` (Line ~53)
Same issue - needs error check before accessing `secActual.grado_id`

---

## Database Schema Expected by Edge Functions

The edge functions expect these 9 tables in the public schema:

### 1. `user_roles`
| Column | Type | Usage |
|--------|------|-------|
| user_id | uuid | FK to auth.users |
| id_rol | integer | FK to rol table |

### 2. `perfiles`
| Column | Type | Usage |
|--------|------|-------|
| id | uuid | PK (FK to auth.users) |
| username | text | User handle |
| nombres | text | First names |
| apellidos | text | Last names |
| cedula | text | ID number |
| activo | boolean | Active status |

### 3. `rol`
| Column | Type | Usage |
|--------|------|-------|
| id_rol | integer | PK |
| nombre | text | Role name (docente, directivo, etc.) |

### 4. `docentes`
| Column | Type | Usage |
|--------|------|-------|
| id_docente | uuid | PK (FK to auth.users) |
| especialidad | text | Teacher specialty (nullable) |

### 5. `anios_escolares`
| Column | Type | Usage |
|--------|------|-------|
| id_anio_escolar | uuid | PK |
| fecha_inicio | date | Start date |
| activo | boolean | Is active |

### 6. `inscripciones`
| Column | Type | Usage |
|--------|------|-------|
| id_inscripcion | uuid | PK |
| estudiante_id | uuid | FK to students |
| seccion_id | uuid | FK to secciones |
| anio_escolar_id | uuid | FK to anios_escolares |
| estado | text | Status (activo, promovido, retirado, repetidor) |

### 7. `secciones`
| Column | Type | Usage |
|--------|------|-------|
| id_seccion | uuid | PK |
| grado_id | integer | Grade level |
| activo | boolean | Is active |

### 8. `estudiantes`
| Column | Type | Usage |
|--------|------|-------|
| id_estudiante | uuid | PK (FK to auth.users?) |

### 9. `lapsos`
| Column | Type | Usage |
|--------|------|-------|
| id_lapso | uuid | PK |

---

## Validation Checklist

- [ ] User confirms correct SERVICE_ROLE env var name
- [ ] User exports real public schema columns
- [ ] All 28 env var references normalized
- [ ] Both .single() calls fixed with error handling
- [ ] Public schema metadata file updated: `03 - tables columns.txt`
- [ ] All 36 edge functions tested against real schema

---

## Implementation Order

1. **First:** User confirms env var name
2. **Second:** Normalize all SERVICE_ROLE references (multi_replace_string_in_file)
3. **Third:** Fix repetir-grado.txt .single() error handling
4. **Fourth:** Fix cambiar-seccion.txt .single() error handling
5. **Fifth:** Update metadata with actual public schema
6. **Sixth:** Re-test all edge functions against real database
