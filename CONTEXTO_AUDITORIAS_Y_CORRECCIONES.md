# CONTEXTO DE AUDITORÍAS Y CORRECCIONES
## Notas-Henry-Pittier Project

**Última actualización:** 2026-06-21  
**Estado:** ✅ CORRECCIONES APLICADAS  
**Responsable:** Auditoría automatizada + correcciones manuales

---

## 📋 DOCUMENTOS RELACIONADOS

Consultar estos archivos para detalles completos:
- [AUDITORIA_TABLAS_EDGE_FUNCTIONS.md](AUDITORIA_TABLAS_EDGE_FUNCTIONS.md) - Lista detallada de tablas inválidas
- [ESTRATEGIA_CORRECCIONES_EDGE_FUNCTIONS.md](ESTRATEGIA_CORRECCIONES_EDGE_FUNCTIONS.md) - Plan de correcciones
- [CORRECCIONES_EDGE_FUNCTIONS.md](CORRECCIONES_EDGE_FUNCTIONS.md) - Status de correcciones previas
- Esquemas: `/supabase/02b_-_public_tables_schema.txt`

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **TABLAS INEXISTENTES EN EDGE FUNCTIONS**

Se encontraron **4 tablas no autorizadas** que causan **51 referencias inválidas**:

| Tabla | Refs | Archivos | Acción |
|---|---:|---:|---|
| `perfiles` | 12 | 8 | ❌ Reemplazar por `docentes` |
| `user_roles` | 31 | 25 | ❌ CREAR o usar metadata |
| `secciones` | 5 | 3 | ❌ CREAR o revisar |
| `rol` | 3 | 2 | ⚠️ Usar metadata de auth |

---

## ✅ ESTADO DE CORRECCIONES PREVIAS

### Correcciones Completadas:
- ✅ Variables de entorno normalizadas a `SUPABASE_SECRET_KEYS`
- ✅ Helper `getServiceRoleKey()` insertado en 34 archivos
- ✅ Eliminadas referencias a `JWT_SECRET` y `verifyJWT`
- ✅ Implementado patrón correcto: `supabaseAdmin.auth.getUser(token)`

### Resultados:
```
- 0 referencias a SUPABASE_ANON_KEY
- 0 referencias a SUPABASE_SERVICE_ROLE_KEY
- 0 referencias a JWT_SECRET
- 0 referencias a verifyJWT
- 34 archivos con SUPABASE_SECRET_KEYS (correcto)
```

---

## 📊 INVENTARIO DE EDGE FUNCTIONS

**Total:** 36 archivos en `/supabase/edge_functions/`

### Por categoría:

**Períodos/Años (6):**
```
periodos-activate_lapso.txt      ⚠️ usa user_roles
periodos-close_anio.txt          ⚠️ usa user_roles
periodos-close_lapso.txt         ⚠️ usa user_roles
periodos-create_anio.txt         ⚠️ usa user_roles
periodos-create_lapso.txt        ⚠️ usa user_roles
periodos-get_activo.txt          ✅
periodos-list_anios.txt          ✅
periodos-list_lapsos.txt         ✅
```

**Secciones (11):**
```
secciones-agregar-materia.txt    ⚠️ usa user_roles
secciones-asignar-docente.txt    ⚠️ usa user_roles
secciones-cambiar-docente.txt    ⚠️ usa user_roles
secciones-clonar-otro-anio.txt   ⚠️ usa user_roles
secciones-clonar.txt             ⚠️ usa user_roles
secciones-crear.txt              ⚠️ usa user_roles
secciones-editar.txt             ⚠️ usa user_roles
secciones-listar-materias.txt    ⚠️ usa user_roles
secciones-listar.txt             ⚠️ usa user_roles
secciones-quitar-materia.txt     ⚠️ usa user_roles
secciones-toggle.txt             ⚠️ usa user_roles
```

**Estudiantes (6):**
```
cambiar-seccion.txt              ⚠️ usa secciones
inscribir-estudiante.txt         ⚠️ usa secciones
listar-estudiantes.txt           ✅
promover-estudiante.txt          ⚠️ usa secciones, user_roles
repetir-grado.txt                ⚠️ usa secciones, user_roles
retirar-estudiante.txt           ⚠️ usa user_roles
```

**Usuarios (8):**
```
users-change_email.txt           ⚠️ usa user_roles
users-create_user.txt            ⚠️ usa perfiles, user_roles
users-delete_user.txt            ⚠️ usa perfiles, user_roles
users-disable_user.txt           ⚠️ usa perfiles, user_roles
users-enable_user.txt            ⚠️ usa perfiles, user_roles
users-get_user.txt               ⚠️ usa perfiles, user_roles, rol
users-list_users.txt             ⚠️ usa perfiles, user_roles, rol
users-reset_password.txt         ⚠️ usa perfiles, user_roles
users-update_user.txt            ⚠️ usa perfiles, user_roles
```

**Otros (5):**
```
debug.txt                        ✅
ping.txt                         ✅
listar-estudiantes.txt           ✅
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS (VÁLIDO)

### Tablas Disponibles en `public` schema:

```
✅ anios_escolares           - Años escolares
✅ asesores_seccion          - Asesores por sección
✅ audit_log                 - Log de auditoría
✅ calificaciones            - Calificaciones
✅ docente_materia_seccion   - Docente-Materia-Sección
✅ docentes                  - Perfil de docentes
✅ estudiantes               - Perfil de estudiantes
✅ evaluaciones              - Evaluaciones
✅ evaluaciones_lapsos       - Evaluaciones por lapso
✅ evaluaciones_notas        - Notas de evaluaciones
✅ inscripciones             - Inscripción estudiante-sección
✅ lapsos                    - Períodos escolares
✅ materias                  - Catálogo de materias
✅ notas_anuales             - Notas finales anuales
✅ notas_lapso               - Notas por lapso
```

### Tablas Referenciadas pero NO EXISTENTES:

```
❌ perfiles                  - Debería ser: docentes
❌ secciones                 - Tabla faltante (CREAR o revisar)
❌ user_roles                - Tabla faltante (CREAR o revisar)
⚠️  rol                      - No es tabla, usar metadata de auth
```

---

## 🔧 DECISIONES REQUERIDAS

### Decisión 1: ¿Qué hacer con `perfiles`?
**Estado:** RECOMENDACIÓN = Reemplazar por `docentes`

**Acción:**
- Reemplazar `from("perfiles")` con `from("docentes")` en 8 archivos
- Validar mapeo de columnas (nota: `docentes` no tiene `cedula`)
- Considerar agregar campo `cedula` a `docentes` o almacenar en metadata de auth

**Archivos afectados:**
```
users-create_user.txt
users-delete_user.txt
users-disable_user.txt
users-enable_user.txt
users-get_user.txt
users-list_users.txt
users-reset_password.txt
users-update_user.txt
```

---

### Decisión 2: ¿Qué hacer con `user_roles`?
**Estado:** PENDIENTE DE USUARIO

**Opción A: CREAR tabla `user_roles`**
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id_rol INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
Afectaría a 25 archivos (periodos, secciones, usuarios)

**Opción B: USAR metadata de auth**
```typescript
const { data: { user } } = await supabaseAdmin.auth.getUser(token);
const rol = user?.user_metadata?.id_rol;
```
Requeriría refactorizar el patrón de validación en 25 archivos

---

### Decisión 3: ¿Qué hacer con `secciones`?
**Estado:** PENDIENTE DE USUARIO

**Opción A: CREAR tabla `secciones`**
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
Afectaría a 3 archivos

**Opción B: REVISAR lógica**
- Usar `inscripciones` para relacionar estudiante-sección-año
- Usar `docente_materia_seccion` para docente-materia-sección

---

### Decisión 4: ¿Qué hacer con referencia a `rol`?
**Estado:** RECOMENDACIÓN = Usar metadata de auth

**Archivos afectados:**
```
users-get_user.txt
users-list_users.txt
```

**Acción:**
```typescript
const { data: { user } } = await supabaseAdmin.auth.getUser(token);
const userRol = user?.user_metadata?.id_rol;
```

---

## 📝 MAPEO DE COLUMNAS

### `perfiles` → `docentes`
```
perfiles.id          → docentes.id (UUID)
perfiles.username    → docentes.username (text)
perfiles.nombres     → docentes.nombres (text)
perfiles.apellidos   → docentes.apellidos (text)
perfiles.cedula      → ❌ NO EXISTE
perfiles.activo      → docentes.activo (boolean)
```

---

## 🚀 PRÓXIMOS PASOS

1. **USUARIO DEBE DECIDIR:**
   - Confirmar si crear `user_roles` o usar metadata
   - Confirmar si crear `secciones` o revisar lógica
   - Agregar campos faltantes a `docentes` (ej: cedula)

2. **DESPUÉS DE DECISIONES:**
   - Aplicar reemplazos de `perfiles` → `docentes`
   - Refactorizar manejo de `user_roles` (25 archivos)
   - Refactorizar manejo de `secciones` (3 archivos)
   - Actualizar refs a `rol` (2 archivos)

3. **VALIDACIÓN FINAL:**
   - Verificar que todas las consultas sean sintácticamente correctas
   - Pruebas de integración con BD real
   - Validar que todas las columnas referenciadas existan

---

## 📌 NOTAS IMPORTANTES

- Las variables de entorno ya están normalizadas a `SUPABASE_SECRET_KEYS`
- El patrón de autenticación es correcto: `supabaseAdmin.auth.getUser(token)`
- No hay referencias a variables obsoletas (JWT_SECRET, verifyJWT, etc.)
- La mayoría de tablas requeridas SÍ existen en el esquema

---

## 💬 PARA OTRAS IAs

Use este documento como contexto para:
- Entender el estado del proyecto
- Conocer qué decisiones requieren usuario
- Aplicar correcciones una vez que el usuario decida
- Referenciar archivos específicos para modificaciones

Archivos clave:
- Schema completo: `/supabase/02b_-_public_tables_schema.txt`
- Edge functions: `/supabase/edge_functions/*.txt`
- Análisis detallado: `AUDITORIA_TABLAS_EDGE_FUNCTIONS.md`
- Plan de correcciones: `ESTRATEGIA_CORRECCIONES_EDGE_FUNCTIONS.md`
