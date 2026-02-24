/**
 * Script de Seed para Familiares
 * Carga datos de prueba en Supabase para el mini-juego
 * Uso: node scripts/seed-familiares.mjs <SERVICE_ROLE_KEY>
 *
 * Si no tienes la service role key, edita USE_ANON_KEY = true abajo
 * (requiere que RLS esté desactivado en la tabla familiares)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ztyvksebdzlupplugfak.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eXZrc2ViZHpsdXBwbHVnZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Njg0MDYsImV4cCI6MjA4NzM0NDQwNn0.aIF9g9ONk_qCRjFQh0zqP_sx-VmQkIrLhCBmKNHuZFc'

// ID del paciente de prueba
const PACIENTE_ID = '7165f511-c999-46a7-881c-755fc3e61510'

// Obtener key del argumento o usar anon key
const SERVICE_ROLE_KEY = process.argv[2] || null
const KEY_TO_USE = SERVICE_ROLE_KEY || ANON_KEY

if (!SERVICE_ROLE_KEY) {
  console.log('⚠️  Usando anon key — RLS debe estar desactivado en la tabla familiares')
  console.log('   Para usar service role key: node scripts/seed-familiares.mjs <TU_SERVICE_ROLE_KEY>\n')
}

const supabase = createClient(SUPABASE_URL, KEY_TO_USE)

// Imágenes públicas de personas reales (randomuser.me)
const FAMILIARES_SEED = [
  {
    paciente_id: PACIENTE_ID,
    nombre: 'María González',
    parentesco: 'madre',
    foto_url: 'https://randomuser.me/api/portraits/women/65.jpg',
    descripcion: 'Tu mamá que siempre te prepara el desayuno favorito',
    mostrar_nombre_en_card: true,
    activo: true,
  },
  {
    paciente_id: PACIENTE_ID,
    nombre: 'Carlos Pérez',
    parentesco: 'padre',
    foto_url: 'https://randomuser.me/api/portraits/men/72.jpg',
    descripcion: 'Tu papá que te enseñó a andar en bicicleta',
    mostrar_nombre_en_card: true,
    activo: true,
  },
  {
    paciente_id: PACIENTE_ID,
    nombre: 'Ana Pérez',
    parentesco: 'hermana',
    foto_url: 'https://randomuser.me/api/portraits/women/32.jpg',
    descripcion: 'Tu hermana menor, siempre alegre y bromista',
    mostrar_nombre_en_card: true,
    activo: true,
  },
  {
    paciente_id: PACIENTE_ID,
    nombre: 'Luis Pérez',
    parentesco: 'hermano',
    foto_url: 'https://randomuser.me/api/portraits/men/45.jpg',
    descripcion: 'Tu hermano mayor, el que más te aconseja',
    mostrar_nombre_en_card: true,
    activo: true,
  },
  {
    paciente_id: PACIENTE_ID,
    nombre: 'Rosa González',
    parentesco: 'abuela',
    foto_url: 'https://randomuser.me/api/portraits/women/85.jpg',
    descripcion: 'La abuelita que hace el mejor arroz con leche',
    mostrar_nombre_en_card: true,
    activo: true,
  },
  {
    paciente_id: PACIENTE_ID,
    nombre: 'Pedro González',
    parentesco: 'abuelo',
    foto_url: 'https://randomuser.me/api/portraits/men/88.jpg',
    descripcion: 'El abuelo que cuenta historias del pasado',
    mostrar_nombre_en_card: true,
    activo: true,
  },
]

async function seed() {
  console.log('🌱 Iniciando seed de familiares...\n')

  // 1. Limpiar registros anteriores del paciente de prueba
  console.log('🧹 Limpiando registros anteriores...')
  const { error: deleteError } = await supabase
    .from('familiares')
    .delete()
    .eq('paciente_id', PACIENTE_ID)

  if (deleteError) {
    console.error('❌ Error al limpiar:', deleteError.message)
    console.log('   Continuando de todos modos...\n')
  } else {
    console.log('   ✅ Registros anteriores eliminados\n')
  }

  // 2. Insertar familiares de prueba
  console.log('📝 Insertando familiares...')
  let exitosos = 0
  let fallidos = 0

  for (const familiar of FAMILIARES_SEED) {
    const { data, error } = await supabase
      .from('familiares')
      .insert(familiar)
      .select()
      .single()

    if (error) {
      console.error(`   ❌ Error al insertar ${familiar.nombre}:`, error.message)
      fallidos++
    } else {
      console.log(`   ✅ ${familiar.nombre} (${familiar.parentesco}) - ID: ${data.id}`)
      exitosos++
    }
  }

  // 3. Resumen
  console.log(`\n📊 Resumen:`)
  console.log(`   ✅ Insertados exitosamente: ${exitosos}`)
  if (fallidos > 0) console.log(`   ❌ Fallidos: ${fallidos}`)

  if (exitosos > 0) {
    console.log(`\n🎮 Datos listos para el mini-juego!`)
    console.log(`   Paciente ID: ${PACIENTE_ID}`)
    console.log(`   Inicia sesión como paciente y haz clic en "Jugar Ahora"`)
  } else {
    console.log('\n💡 Si todos fallaron, necesitas la service role key:')
    console.log('   Supabase → Settings → API → service_role')
    console.log('   node scripts/seed-familiares.mjs <SERVICE_ROLE_KEY>')
  }
}

seed().catch(console.error)
