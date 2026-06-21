# AUDITORÍA CORRECTA - EDGE FUNCTIONS vs SCHEMA REAL
**Fecha:** 2026-06-21  
**Status:** ⚠️ ERRORES ENCONTRADOS EN NOMBRES DE CAMPOS

---

## 📊 RESUMEN EJECUTIVO

Se encontraron **errores en NOMBRES DE CAMPOS** en las edge functions. Las tablas existen pero los campos referenciados NO COINCIDEN con el esquema real:

| Tabla | Errores | Gravedad | Archivos |
|---|---:|---|---|
| `secciones` | 3 | 🔴 CRÍTICO | cambiar-seccion, inscribir-estudiante, repetir-grado |
| `docentes` | 2 | 🔴 CRÍTICO | users-create_user, usuarios (especialidad, id_docente) |
| `anios_escolares` | 1 | 🔴 CRÍTICO | inscribir-estudiante, repetir-grado |
| `inscripciones` | 1 | 🟠 MAYOR | inscribir-estudiante, repetir-grado |

---

## 🔍 ERRORES DETALLADOS

### 1. TABLA `secciones` - Campo `grado_id` NO EXISTE

**Esquema Real:**
```
id_seccion (serial)
nombre (varchar)
grado (integer)        ← ¡NO es `grado_id`!
letra (char)
anio_escolar_id (integer)
activo (boolean)
```

**Error encontrado:**
- Código busca: `.select("grado_id")` ❌
- Debe ser: `.select("grado")` ✅

**Archivos afectados (3):**
```
✗ cambiar-seccion.txt (línea ~54 y ~72)
  .from("secciones").select("grado_id, activo")
  
✗ repetir-grado.txt (línea ~)
  .from("secciones").select("grado_id")
```

**Corrección necesaria:**
Reemplazar todos los `grado_id` por `grado` en consultas a `secciones`

---

### 2. TABLA `anios_escolares` - Campo `id_anio_escolar` NO EXISTE

**Esquema Real:**
```
id_anio (integer)      ← ¡NO es `id_anio_escolar`!
nombre (varchar)
fecha_inicio (date)
fecha_fin (date)
activo (boolean)
created_at (timestamp)
```

**Errores encontrados:**
- Código busca: `.eq("id_anio_escolar", id)` ❌
- Debe ser: `.eq("id_anio", id)` ✅

**Archivos afectados (2):**
```
✗ inscribir-estudiante.txt (línea ~93)
  .select("id_anio_escolar, activo")
  .eq("id_anio_escolar", anio_escolar_id)
  
✗ repetir-grado.txt (línea ~)
  Similar problema
```

**Corrección necesaria:**
Reemplazar `id_anio_escolar` por `id_anio` en todas las consultas

---

### 3. TABLA `docentes` - Campos INEXISTENTES

**Esquema Real:**
```
id (UUID)
username (text)
nombres (text)
apellidos (text)
activo (boolean)
```

**Errores encontrados:**

#### Error A: Campo `id_docente` NO EXISTE
- Código intenta: `.insert({ id_docente: userId, ... })` ❌
- Debe ser: `.insert({ id: userId, ... })` ✅

#### Error B: Campo `especialidad` NO EXISTE
- Código intenta: `.insert({ especialidad: especialidad })` ❌
- **Solución:** Almacenar en metadata de auth o agregar campo

**Archivos afectados (1):**
```
✗ users-create_user.txt (línea ~165)
  .from("docentes").insert({
    id_docente: userId,      ← INCORRECTO
    especialidad: especialidad || null,  ← NO EXISTE
  })
```

**Correcciones necesarias:**
1. Cambiar `id_docente` → `id`
2. Cambiar `especialidad` → metadata o crear campo

---

### 4. TABLA `inscripciones` - Mismatch de Campos

**Esquema Real:**
```
id_inscripcion (serial)
estudiante_id (integer)
seccion_id (integer)
anio_escolar_id (integer)  ← ¡Es `anio_escolar_id`, NO `id_anio_escolar`!
estado (varchar)
created_at (timestamp)
```

**Errores encontrados:**

En `inscribir-estudiante.txt` línea ~118:
```typescript
.insert({
  estudiante_id,        ← ✅ CORRECTO
  seccion_id,          ← ✅ CORRECTO
  anio_escolar_id,     ← ✅ CORRECTO
  estado: "activo",    ← ✅ CORRECTO
})
```
**Este archivo está BIEN para inscripciones** ✅

---

## 🔧 LISTA DE CORRECCIONES NECESARIAS

### Corrección 1: Cambiar `grado_id` → `grado`

**Archivos:** `cambiar-seccion.txt`, `repetir-grado.txt`

**Buscar y reemplazar:**
```
.select("grado_id")  →  .select("grado")
.eq("grado_id"       →  .eq("grado"
```

---

### Corrección 2: Cambiar `id_anio_escolar` → `id_anio`

**Archivos:** `inscribir-estudiante.txt`, `repetir-grado.txt`

**Buscar y reemplazar:**
```
"id_anio_escolar"  →  "id_anio"
.eq("id_anio_escolar"  →  .eq("id_anio"
```

---

### Corrección 3: Cambiar `id_docente` → `id` en tabla docentes

**Archivo:** `users-create_user.txt` (línea ~165)

**Cambiar:**
```typescript
// ACTUAL (INCORRECTO):
if (rol === "docente") {
  const { error: docError } = await supabaseAdmin
    .from("docentes")
    .insert({
      id_docente: userId,
      especialidad: especialidad || null,
    });
}

// CORRECTO:
if (rol === "docente") {
  const { error: docError } = await supabaseAdmin
    .from("docentes")
    .insert({
      id: userId,
      username: email.split("@")[0],
      nombres: nombres,
      apellidos: apellidos,
      activo: true,
    });
}
```

---

## ✅ CAMPOS CORRECTOS (SIN ERRORES)

### Tabla `perfiles` - USO CORRECTO ✅
```typescript
.insert({
  id: userId,          ✅
  username: ...,       ✅
  nombres: ...,        ✅
  apellidos: ...,      ✅
  cedula: ...,         ✅
  activo: true,        ✅
})
```

### Tabla `user_roles` - USO CORRECTO ✅
```typescript
.insert({ 
  user_id: userId,     ✅
  id_rol: idRol 
})

.select("id_rol")      ✅
.eq("user_id", userId) ✅
```

### Tabla `inscripciones` - USO CORRECTO ✅
```typescript
.insert({
  estudiante_id,       ✅
  seccion_id,          ✅
  anio_escolar_id,     ✅
  estado: "activo",    ✅
})
```

---

## 📋 CHECKLIST DE CORRECCIONES

- [ ] Cambiar `grado_id` → `grado` en `cambiar-seccion.txt`
- [ ] Cambiar `grado_id` → `grado` en `repetir-grado.txt`
- [ ] Cambiar `id_anio_escolar` → `id_anio` en `inscribir-estudiante.txt`
- [ ] Cambiar `id_anio_escolar` → `id_anio` en `repetir-grado.txt`
- [ ] Cambiar `id_docente` → `id` en `users-create_user.txt`
- [ ] Reemplazar/migrar campo `especialidad` en `users-create_user.txt`
- [ ] Validar que no hay más referencias a estos campos incorrectos
- [ ] Pruebas de integración

---

## ⚠️ NOTAS IMPORTANTES

1. **Las tablas SÍ EXISTEN** en Supabase - el problema es solo NOMBRES DE CAMPOS
2. **Todas las relaciones están correctas** (user_roles, perfiles, etc.)
3. **La mayoría del código funciona bien** - solo hay mismatches de nombres
4. **El campo `especialidad` en docentes:**
   - NO EXISTE en el esquema actual
   - Opciones:
     a) Agregarlo a la tabla `docentes`
     b) Almacenarlo en `auth.users.user_metadata`
     c) Eliminar de la lógica
