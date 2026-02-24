# Crear Usuarios - Alternativas para evitar Rate Limit

## 🔴 Problema Actual
Supabase tiene `over_email_send_rate_limit` activado - no podemos crear usuarios nuevos en este momento.

## ✅ Soluciones Disponibles

### Solución 1: Esperar (15-60 minutos)
El rate limit se resetea automáticamente. Luego ejecutar:
```bash
# Esperar 15-20 minutos y volver a intentar
sleep 900  # 15 minutos

# Luego ejecutar:
curl -s -X POST "http://localhost:3000/api/usuarios-autenticacion/crearUsuario" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Carlos García","correo":"drcarlos@douremember.app","contrasenia":"DrCarlos12345","rol":"doctor"}'
```

---

### Solución 2: Crear usuarios mediante Invitaciones (Recomendado) ⭐

Supabase permite crear usuarios sin pasar por el rate limit usando invitaciones:

```bash
# 1. Crear invitación para Doctor
SUPABASE_URL="https://ztyvksebdzlupplugfak.supabase.co"
SERVICE_ROLE_KEY="su_service_role_key_aquí"  # Obtener del dashboard

curl -X POST "${SUPABASE_URL}/auth/v1/invite" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@douremember.app",
    "data": {"nombre": "Carlos García", "rol": "doctor"}
  }'
```

Para obtener la `SERVICE_ROLE_KEY`:
1. Ve a Supabase Dashboard
2. Project Settings → API → service_role (secret key)
3. Copia el valor

---

### Solución 3: Crear usuarios directamente en BD (Sin Auth)

Si el rate limit está muy estricto, crear registros directamente:

```sql
-- En Supabase SQL Editor, crear tabla de usuarios primero si no existe:
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL,
  contrasenia_hash TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Luego insertar usuarios (las contraseñas deberían estar hasheadas en producción):
INSERT INTO public.usuarios (correo, nombre, rol) VALUES
('doctor@douremember.app', 'Carlos García', 'doctor'),
('paciente@douremember.app', 'Juan Pérez', 'paciente'),
('cuidador@douremember.app', 'María López', 'cuidador');
```

---

### Solución 4: Usar Frontend para Registro

El frontend tiene un formulario de registro que ya maneja el auth:

1. Abre http://localhost:3000 en el navegador
2. Ve a `/auth/register` o `/register`
3. Completa el formulario:
   - Email: `doctor@douremember.app`
   - Contraseña: `DrCarlos12345`
   - Nombre: `Carlos García`
   - Rol: `doctor`
4. Repite para paciente y cuidador

---

## 📋 Pasos a Seguir Ahora

### Opción A: Esperar + Reintentar (Más seguro)
```bash
# 1. Esperar 15-20 minutos
# 2. Luego ejecutar el script
bash scripts/create-test-accounts.sh
```

### Opción B: Crear en Frontend (Más rápido)
1. Abre http://localhost:3000
2. Regístrate como doctor
3. Regístrate como paciente (desde otro navegador/incógnito)
4. Regístrate como cuidador

### Opción C: Usar SQL directo (Más complicado pero funciona)
1. Ve a Supabase Dashboard
2. SQL Editor
3. Copia y ejecuta el SQL de "Solución 3" arriba

---

## 🎯 Recomendación Final

**Usa Opción B (Frontend)** porque:
- ✅ Funciona inmediatamente
- ✅ Prueba todo el flujo de auth
- ✅ Más confiable que esperar rate limits
- ✅ Puedes verificar que el frontend y backend están conectados

---

## 📝 Credenciales por Defecto (Una Vez Creadas)

```
Doctor:
  Email:    doctor@douremember.app
  Password: DrCarlos12345
  Nombre:   Carlos García
  Rol:      doctor

Paciente:
  Email:    paciente@douremember.app
  Password: Paciente12345
  Nombre:   Juan Pérez
  Rol:      paciente

Cuidador:
  Email:    cuidador@douremember.app
  Password: Cuidador12345
  Nombre:   María López
  Rol:      cuidador
```

---

## Siguiente Paso: Testing Gamificación

Una vez creadas las cuentas, sigue estos pasos:

1. **Cuidador** → Agregar familiares con fotos
   - URL: `/familiares/gestion?pacienteId=<PATIENT_ID>`
   - Agregar 3-4 familiares

2. **Paciente** → Jugar mini-juego
   - URL: `/familiares/minijuego`
   - Jugar varias rondas

3. **Doctor** → Ver métricas
   - URL: `/familiares/metricas?pacienteId=<PATIENT_ID>&nombre=<PATIENT_NAME>`
   - Verificar estadísticas

---

Generated: 2026-02-23
Status: Ready for user action
