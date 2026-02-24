# Testing Plan: Gamificación DoURemember

## ✅ Completed Setup

### 1. Backend `.env` Configuration
- ✅ Configured Supabase credentials
- ✅ Added dummy values for non-critical services
- Location: `Douremember-launcher/.env`

### 2. Frontend `.env` Configuration
- ✅ Updated `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Location: `UAO2025_3-D3vCor3Bits-DoURememberApp/.env`

### 3. Docker Compose
- 🔄 Starting backend services...
- Command: `docker compose up --build`
- Location: `Douremember-launcher/`

---

## 📋 Next Steps Required

### Step 1: Create Supabase Tables
Execute this SQL in Supabase Dashboard (SQL Editor):

```sql
-- 1. Create familiares table
CREATE TABLE familiares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL,
  foto_url TEXT NOT NULL,
  nombre TEXT,
  parentesco TEXT NOT NULL,
  descripcion TEXT,
  audio_url TEXT,
  mostrar_nombre_en_card BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create minijuego_sesiones table
CREATE TABLE minijuego_sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  puntuaje_total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create minijuego_rondas table
CREATE TABLE minijuego_rondas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL,
  familiar_id UUID NOT NULL,
  respuesta_usuario TEXT,
  es_correcta BOOLEAN,
  intentos INTEGER NOT NULL,
  nivel_ayuda_final INTEGER NOT NULL,
  puntos_obtenidos INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Disable RLS on all tables
ALTER TABLE familiares DISABLE ROW LEVEL SECURITY;
ALTER TABLE minijuego_sesiones DISABLE ROW LEVEL SECURITY;
ALTER TABLE minijuego_rondas DISABLE ROW LEVEL SECURITY;
```

### Step 2: Create Supabase Storage Buckets

Via Supabase Dashboard → Storage:
1. Create bucket: `familiares-fotos` (public)
2. Create bucket: `familiares-audios` (public)

---

## 🎮 Test Scenario: Complete Gamification Flow

### Test Accounts
```
Doctor:
  Email: doctor@test.com
  Password: Doctor123!

Patient:
  Email: paciente@test.com
  Password: Paciente123!

Caregiver:
  Email: cuidador@test.com
  Password: Cuidador123!
```

### Test Flow

#### 1. **Cuidador (Caregiver)** - Add Familiares
- [ ] Login: `cuidador@test.com` / `Cuidador123!`
- [ ] Navigate to: `/familiares/gestion?pacienteId=<PATIENT_ID>`
- [ ] Add 3-4 family members with:
  - Name: e.g., "Madre", "Padre", "Hermana"
  - Parentesco (Relationship)
  - Photo (upload image)
  - Optional: Audio description
- [ ] Verify familiares are saved in Supabase `familiares` table

#### 2. **Paciente (Patient)** - Play Mini-Game
- [ ] Login: `paciente@test.com` / `Paciente123!`
- [ ] Navigate to: `/familiares/minijuego`
- [ ] Play game:
  - [ ] See familiar photo
  - [ ] Enter name
  - [ ] System shows help levels (1-4)
  - [ ] Receive points based on help level
- [ ] Complete game session
- [ ] Verify in Supabase:
  - [ ] `minijuego_sesiones` has new session
  - [ ] `minijuego_rondas` has round records

#### 3. **Doctor (Médico)** - View Metrics
- [ ] Login: `doctor@test.com` / `Doctor123!`
- [ ] Navigate to: `/familiares/metricas?pacienteId=<PATIENT_ID>&nombre=<PATIENT_NAME>`
- [ ] Verify metrics displayed:
  - [ ] Total sessions
  - [ ] Total score
  - [ ] Success percentage
  - [ ] Difficulty by familiar

---

## 🔧 Services Status

### Should Work ✅
- NATS Server (message broker)
- Gateway (API, port 3000)
- usuarios-autenticacion-ms (auth service)

### Known Issues ⚠️
- `descripciones-imagenes-ms`: Image processing disabled (Gemini API = dummy)
- `alertas-reportes-ms`: Email sending disabled (Resend API = dummy)

---

## 🧪 Testing Commands

### Create Test Accounts
```bash
bash scripts/create-test-accounts.sh
```

### Test Backend Health
```bash
curl http://localhost:3000/health
```

### Test Auth Endpoint
```bash
curl -X POST http://localhost:3000/api/usuarios-autenticacion/crearUsuario \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!",
    "nombre": "Test",
    "apellido": "User",
    "tipo_usuario": "paciente"
  }'
```

---

## 📊 Gamification Data Model

### Familiar
```typescript
{
  id: UUID,
  paciente_id: UUID,
  foto_url: string,       // Public URL from storage
  nombre: string | null,
  parentesco: string,     // 'madre', 'padre', 'hermano', etc.
  descripcion: string | null,
  audio_url: string | null,
  mostrar_nombre_en_card: boolean,
  activo: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Mini-Juego Session
```typescript
{
  id: UUID,
  paciente_id: UUID,
  fecha_inicio: timestamp,
  fecha_fin: timestamp | null,
  puntuaje_total: number,
  created_at: timestamp
}
```

### Mini-Juego Round
```typescript
{
  id: UUID,
  sesion_id: UUID,
  familiar_id: UUID,
  respuesta_usuario: string | null,
  es_correcta: boolean | null,
  intentos: number,
  nivel_ayuda_final: number,    // 1-4
  puntos_obtenidos: number,
  created_at: timestamp
}
```

### Points by Help Level
- Level 1 (no help): 10 points
- Level 2: 8 points
- Level 3: 6 points
- Level 4 (max help): 4 points

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
docker compose logs -f

# Restart services
docker compose restart
```

### Database connection errors
- Verify Supabase credentials in `Douremember-launcher/.env`
- Ensure tables are created
- Check RLS is disabled

### Frontend auth errors
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3000` in `.env`
- Check backend health: `curl http://localhost:3000/health`

---

## ✨ Success Criteria

- [ ] Backend services running (gateway, nats, auth-ms)
- [ ] Supabase tables created and accessible
- [ ] Storage buckets created and public
- [ ] Test accounts created
- [ ] Cuidador can add familiares with photos
- [ ] Paciente can play mini-game and get points
- [ ] Doctor can view gamification metrics
- [ ] Data persists in Supabase

---

Generated: 2026-02-23
