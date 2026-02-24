# Plan de Pruebas - Feature: Galeria Familiar & Mini-juego de Reconocimiento

**Proyecto:** DoURememberApp
**Version:** 0.2.0
**Fecha:** 2025-02-22
**Equipo:** D3vCor3Bits

---

## 1. Objetivo

Validar que la funcionalidad "Galeria Familiar & Mini-juego de Reconocimiento" cumple con todos los requisitos funcionales (RF-01 a RF-09), no funcionales (RNF-01 a RNF-04) y las 11 Historias de Usuario (HU-001 a HU-011) definidas en la especificacion del proyecto.

---

## 2. Alcance

### 2.1 En Alcance
- CRUD de familiares (crear, leer, actualizar, desactivar)
- Galeria de fotos familiares con cards
- Mini-juego de reconocimiento con validacion de respuestas
- Sistema de ayuda progresiva (4 niveles)
- Sistema de puntuacion
- Pantalla de fin de sesion
- Persistencia de resultados en Supabase
- Dashboard de metricas
- Reproduccion de audio bajo demanda
- Navegacion integrada en dashboards existentes (paciente, cuidador, medico)

### 2.2 Fuera de Alcance
- Funcionalidades existentes de la app (sesiones de descripcion de imagenes)
- Autenticacion y registro de usuarios (ya existente)
- API externa (api.devcorebits.com) - funcionalidad previa

---

## 3. Estrategia de Pruebas

### 3.1 Niveles de Prueba

| Nivel | Herramienta | Ubicacion | Cantidad |
|-------|------------|-----------|----------|
| Unitarias | Jest 30 | `src/__tests__/familiares/` | 7 archivos |
| Componentes | Jest + React Testing Library | `src/__tests__/familiares/` | 3 archivos |
| E2E | Cypress 15.6 | `src/cypress/e2e/familiares/` | 4 archivos |

### 3.2 Criterios de Aceptacion/Rechazo

- **Aceptacion:** 100% de tests unitarios pasan, 100% de tests E2E criticos pasan
- **Rechazo:** Cualquier test critico falla, regresion en funcionalidad existente

---

## 4. Matriz de Trazabilidad: Tests vs Requisitos

### 4.1 Historias de Usuario

| HU | Descripcion | Test Unitario | Test Componente | Test E2E |
|----|-------------|---------------|-----------------|----------|
| HU-001 | CRUD de familiares | - | - | `gestion.cy.ts` |
| HU-002 | Galeria de cards con fotos | `familiares.types.test.ts` | `FamiliarCard.test.tsx` | `galeria.cy.ts` |
| HU-003 | Modal de recuerdo | `useAudioPlayer.test.ts` | - | `galeria.cy.ts` |
| HU-004 | Inicio del mini-juego | - | `MiniJuegoBoard.test.tsx` | `minijuego.cy.ts` |
| HU-005 | Validacion de respuestas | `normalizarTexto.test.ts` | `MiniJuegoBoard.test.tsx` | `minijuego.cy.ts` |
| HU-006 | Ayuda progresiva | - | `MiniJuegoBoard.test.tsx` | `minijuego.cy.ts` |
| HU-007 | Reproduccion de audio | `useAudioPlayer.test.ts` | - | `minijuego.cy.ts` |
| HU-008 | Sistema de puntuacion | `puntuacion.test.ts` | `MiniJuegoBoard.test.tsx` | `minijuego.cy.ts` |
| HU-009 | Pantalla de fin | - | `PantallaFin.test.tsx` | `minijuego.cy.ts` |
| HU-010 | Persistencia de resultados | - | - | `metricas.cy.ts` |
| HU-011 | Dashboard de metricas | - | - | `metricas.cy.ts` |

### 4.2 Requisitos Funcionales

| RF | Descripcion | Tests que lo cubren |
|----|-------------|---------------------|
| RF-01 | CRUD familiares (foto, parentesco, nombre, descripcion, audio) | `gestion.cy.ts` |
| RF-02 | Galeria con foto + icono de parentesco + nombre condicional | `FamiliarCard.test.tsx`, `galeria.cy.ts` |
| RF-03 | Modal con foto, nombre, parentesco, descripcion, audio | `galeria.cy.ts` |
| RF-04 | Validacion: trim, case-insensitive, sin tildes | `normalizarTexto.test.ts`, `MiniJuegoBoard.test.tsx` |
| RF-05 | Ayuda progresiva: 4 niveles (foto -> nombre -> descripcion -> audio) | `MiniJuegoBoard.test.tsx` (calcularSiguienteNivel) |
| RF-06 | Puntuacion: Nivel 1=10, 2=8, 3=6, 4=4 puntos | `puntuacion.test.ts`, `familiares.types.test.ts` |
| RF-07 | Audio: solo bajo accion del usuario (NO auto-play) | `useAudioPlayer.test.ts`, `minijuego.cy.ts` |
| RF-08 | Persistencia en Supabase (familiares, sesiones, rondas) | `metricas.cy.ts` |
| RF-09 | Dashboard metricas: sesiones, puntaje, % aciertos, dificultad por familiar | `metricas.cy.ts` |

### 4.3 Requisitos No Funcionales

| RNF | Descripcion | Como se verifica |
|-----|-------------|-----------------|
| RNF-01 | Imagenes lazy loading | `FamiliarCard.test.tsx` (atributo loading="lazy") |
| RNF-02 | Accesibilidad teclado (Enter/Space) | `FamiliarCard.test.tsx` (keyboard events) |
| RNF-03 | Responsive (2/3/4 columnas) | `galeria.cy.ts` (viewport testing) |
| RNF-04 | SOLID: Open/Closed (nuevos modulos, sin modificar existentes) | Revision de codigo (principio arquitectonico) |

---

## 5. Detalle de Casos de Prueba

### 5.1 Tests Unitarios

#### `familiares.types.test.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | PUNTOS_POR_NIVEL[1] = 10 | RF-06 | 10 |
| 2 | PUNTOS_POR_NIVEL[2] = 8 | RF-06 | 8 |
| 3 | PUNTOS_POR_NIVEL[3] = 6 | RF-06 | 6 |
| 4 | PUNTOS_POR_NIVEL[4] = 4 | RF-06 | 4 |
| 5 | Puntos disminuyen con cada nivel | RF-06 | Decreciente |
| 6 | PARENTESCOS tiene >= 5 opciones | RF-01 | true |
| 7 | Cada parentesco tiene value, label, icon | RF-01 | true |
| 8 | Incluye madre, padre, hermano, hijo, abuelo | RF-01 | true |
| 9 | getParentescoIcon retorna icono correcto | RF-02 | Emoji correcto |
| 10 | getParentescoIcon retorna default para desconocido | RF-02 | Emoji default |
| 11 | getParentescoLabel retorna label correcto | RF-02 | String correcto |
| 12 | getParentescoLabel retorna valor original si desconocido | RF-02 | String original |

#### `normalizarTexto.test.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Eliminar espacios inicio/final | RF-04, HU-005 CA3 | "maria" |
| 2 | Normalizar multiples espacios internos | RF-04 | "maria elena" |
| 3 | Manejar string vacio | RF-04 | "" |
| 4 | Manejar solo espacios | RF-04 | "" |
| 5 | Convertir MAYUSCULAS a minusculas | RF-04, HU-005 CA3 | "maria" |
| 6 | Manejar mixed case | RF-04 | "juan pablo" |
| 7 | Igualdad case-insensitive | RF-04 | true |
| 8 | Eliminar tildes en vocales | RF-04, HU-005 CA3 | "maria", "jose", "raul" |
| 9 | Normalizar ene (NFD) | RF-04 | "tono" |
| 10 | Manejar dieresis | RF-04 | "angela" |
| 11 | Igualdad con/sin tildes | RF-04 | true |
| 12 | Caso combinado: tildes + mayusculas + espacios | RF-04 | "maria elena" |
| 13 | "maria" == "Maria" | HU-005 CA1 | true |
| 14 | "JOSE" == "Jose" | HU-005 CA1 | true |
| 15 | "  carlos  " == "Carlos" | HU-005 CA1 | true |

#### `puntuacion.test.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Nivel 1 = 10 pts | RF-06, HU-008 CA1 | 10 |
| 2 | Nivel 2 = 8 pts | RF-06, HU-008 CA1 | 8 |
| 3 | Nivel 3 = 6 pts | RF-06, HU-008 CA1 | 6 |
| 4 | Nivel 4 = 4 pts | RF-06, HU-008 CA1 | 4 |
| 5 | 3 familiares nivel 1 = 30 pts | HU-008 | 30 |
| 6 | 2 nivel 1 + 1 nivel 3 = 26 pts | HU-008 | 26 |
| 7 | Puntaje maximo 5 familiares = 50 pts | HU-008 | 50 |
| 8 | Puntaje minimo 5 familiares = 20 pts | HU-008 | 20 |
| 9 | 30/50 = 60% | HU-009 CA2 | 60 |
| 10 | 50/50 = 100% | HU-009 CA2 | 100 |
| 11 | 0/50 = 0% | HU-009 CA2 | 0 |

#### `useAudioPlayer.test.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Estado inicial: no reproduciendo | RF-07 | isPlaying = false |
| 2 | Sin error inicial | RF-07 | error = null |
| 3 | Interfaz tiene play, pause, resume, stop | HU-007 CA1 | Funciones existen |
| 4 | Diferencia playing, paused, stopped | HU-007 CA2 | Estados correctos |
| 5 | Audio requiere accion del usuario | HU-003 CA4 | autoPlay = false |
| 6 | Maneja URLs validas | HU-003 CA4 | URL truthy |
| 7 | Maneja URL null sin error | HU-003 CA4 | No crea Audio |

### 5.2 Tests de Componentes (React Testing Library)

#### `FamiliarCard.test.tsx`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Renderiza foto del familiar | HU-002 CA1 | img con src correcto |
| 2 | Usa lazy loading | RNF-01 | loading="lazy" |
| 3 | NO muestra nombre si flag false | HU-002 CA2 | No nombre visible |
| 4 | Muestra nombre si flag true | HU-002 CA2 | Nombre visible |
| 5 | NO muestra nombre si es null + flag true | HU-002 CA2 | No nombre visible |
| 6 | NO renderiza sin foto_url | HU-002 CA3 | null |
| 7 | Muestra icono de parentesco | RF-02 | Icono presente |
| 8 | Accesible por teclado (role=button) | RNF-02 | role=button, tabIndex=0 |
| 9 | onClick al presionar Enter | RNF-02 | Handler ejecutado |
| 10 | onClick al presionar Space | RNF-02 | Handler ejecutado |
| 11 | onClick al hacer click | General | Handler ejecutado |

#### `MiniJuegoBoard.test.tsx`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Acepta respuesta correcta normalizada | HU-005 CA1 | Coincide |
| 2 | Rechaza respuesta incorrecta | HU-005 CA2 | No coincide |
| 3 | Normaliza tildes, mayusculas, espacios | HU-005 CA3 | Coincide |
| 4 | Multiples formatos de respuesta | HU-005 | Todos coinciden |
| 5 | Avance nivel 1 -> 2 | HU-006 CA1 | nivel = 2 |
| 6 | Avance nivel 2 -> 3 | HU-006 CA1 | nivel = 3 |
| 7 | Avance nivel 3 -> 4 | HU-006 CA1 | nivel = 4 |
| 8 | Salta nivel 3 sin descripcion | HU-006 | nivel = 4 |
| 9 | Se queda si no hay audio en nivel 4 | HU-006 | nivel = 3 |
| 10 | Sin descripcion ni audio: queda en nivel 2 | HU-006 | nivel = 2 |
| 11 | Nivel 4 no avanza mas | HU-006 | nivel = 4 |
| 12 | Puntaje total sesion mixta | HU-008 | 38 pts |
| 13 | Porcentaje de logro | HU-008 | 76% |
| 14 | Pantalla inicio con boton | HU-004 CA1 | Boton visible |
| 15 | Foto visible durante juego | HU-004 CA2 | img presente |
| 16 | Campo texto + boton validar | HU-004 | Presentes |
| 17 | Pantalla fin: mensaje completada | HU-009 | Texto visible |
| 18 | Pantalla fin: puntaje | HU-009 | Puntaje visible |
| 19 | Pantalla fin: boton reiniciar | HU-009 CA3 | Boton visible |
| 20 | Pantalla fin: boton galeria | HU-009 CA3 | Boton visible |

#### `PantallaFin.test.tsx`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Muestra mensaje de sesion completada | HU-009 CA1 | Texto visible |
| 2 | Muestra puntaje vs maximo | HU-009 CA1 | "30 / 50" |
| 3 | Muestra porcentaje | HU-009 CA1 | "60%" |
| 4 | 100% = 5 estrellas | HU-009 CA2 | 5 estrellas |
| 5 | 80% = 4 estrellas | HU-009 CA2 | 4 estrellas |
| 6 | 60% = 3 estrellas | HU-009 CA2 | 3 estrellas |
| 7 | 40% = 2 estrellas | HU-009 CA2 | 2 estrellas |
| 8 | 10% = 1 estrella | HU-009 CA2 | 1 estrella |
| 9 | 0% = 0 estrellas | HU-009 CA2 | 0 estrellas |
| 10 | Boton "Jugar de Nuevo" presente | HU-009 CA3 | Visible |
| 11 | Boton "Ver Galeria" presente | HU-009 CA3 | Visible |
| 12 | Click "Jugar de Nuevo" llama handler | HU-009 CA3 | Handler llamado |
| 13 | Click "Ver Galeria" llama handler | HU-009 CA3 | Handler llamado |
| 14 | 0 familiares no causa error | Robustez | Sin error |
| 15 | 1 familiar puntaje maximo | Robustez | "10 / 10" |

### 5.3 Tests E2E (Cypress)

#### `galeria.cy.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Pagina de galeria carga | HU-002 | Pagina visible |
| 2 | Muestra titulo "Galeria Familiar" | HU-002 | Titulo visible |
| 3 | Grid responsive de cards | HU-002, RNF-03 | Grid presente |
| 4 | Cards muestran imagen | HU-002 CA1 | Imagenes visibles |
| 5 | Modal se abre al click | HU-003 CA1 | Modal visible |
| 6 | Boton de navegacion al mini-juego | HU-002 | Link presente |

#### `minijuego.cy.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Pantalla inicial del mini-juego | HU-004 CA1 | Pagina carga |
| 2 | Boton "Iniciar Juego" visible | HU-004 CA1 | Boton presente |
| 3 | Mensaje si no hay familiares | HU-004 | Mensaje visible |
| 4 | Campo de respuesta presente | HU-005 | Input visible |
| 5 | Boton validar/enviar presente | HU-005 | Boton visible |
| 6 | Audio NO auto-play | RF-07 | Audio pausado |
| 7 | Puntaje en interfaz | HU-008 | Puntaje visible |
| 8 | Navegacion de regreso | HU-009 | Link presente |

#### `gestion.cy.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Pagina de gestion carga | HU-001 | Pagina visible |
| 2 | Titulo de gestion visible | HU-001 | Titulo presente |
| 3 | Formulario de registro presente | HU-001 CA1 | Campos visibles |
| 4 | Selector de parentesco | HU-001, RF-01 | Select presente |
| 5 | Opcion de subir foto | HU-001 CA1 | Upload presente |
| 6 | Validacion campos obligatorios | HU-001 | Permanece en pagina |

#### `metricas.cy.ts`
| # | Caso | RF/HU | Resultado Esperado |
|---|------|-------|-------------------|
| 1 | Pagina de metricas carga | HU-011 | Pagina visible |
| 2 | Titulo de metricas visible | HU-011 | Titulo presente |
| 3 | Estadisticas de sesiones | HU-011 CA1 | Stats visibles |
| 4 | Porcentaje de aciertos | HU-011, RF-09 | Porcentaje visible |
| 5 | Datos persistidos | HU-010 | Datos o empty state |
| 6 | Tabla de familiares con dificultad | HU-011 CA2 | Tabla presente |

---

## 6. Comandos de Ejecucion

### 6.1 Tests Unitarios + Componentes (Jest)
```bash
# Ejecutar todos los tests de familiares
npx jest --testPathPattern="familiares" --verbose

# Ejecutar un archivo especifico
npx jest --testPathPattern="normalizarTexto" --verbose

# Ejecutar con coverage
npx jest --testPathPattern="familiares" --coverage
```

### 6.2 Tests E2E (Cypress)
```bash
# Abrir Cypress en modo interactivo
npx cypress open

# Ejecutar tests E2E en modo headless
npx cypress run --spec "src/cypress/e2e/familiares/**/*.cy.ts"

# Ejecutar un archivo E2E especifico
npx cypress run --spec "src/cypress/e2e/familiares/galeria.cy.ts"
```

### 6.3 Todos los tests
```bash
# Jest (unitarios + componentes)
npm test

# Cypress (E2E)
npx cypress run
```

---

## 7. Inventario de Archivos de Tests

### 7.1 Tests Unitarios
| Archivo | Linea | Tests |
|---------|-------|-------|
| `src/__tests__/familiares/familiares.types.test.ts` | Tipos y utilidades | 12 |
| `src/__tests__/familiares/normalizarTexto.test.ts` | Normalizacion de texto | 15 |
| `src/__tests__/familiares/puntuacion.test.ts` | Sistema de puntuacion | 11 |
| `src/__tests__/familiares/useAudioPlayer.test.ts` | Hook de audio | 7 |

### 7.2 Tests de Componentes
| Archivo | Componente | Tests |
|---------|-----------|-------|
| `src/__tests__/familiares/FamiliarCard.test.tsx` | FamiliarCard | 11 |
| `src/__tests__/familiares/MiniJuegoBoard.test.tsx` | MiniJuegoBoard | 20 |
| `src/__tests__/familiares/PantallaFin.test.tsx` | PantallaFin | 15 |

### 7.3 Tests E2E
| Archivo | Flujo | Tests |
|---------|-------|-------|
| `src/cypress/e2e/familiares/galeria.cy.ts` | Galeria familiar | 6 |
| `src/cypress/e2e/familiares/minijuego.cy.ts` | Mini-juego completo | 8 |
| `src/cypress/e2e/familiares/gestion.cy.ts` | CRUD familiares | 6 |
| `src/cypress/e2e/familiares/metricas.cy.ts` | Dashboard metricas | 6 |

### Total: ~117 casos de prueba

---

## 8. Cobertura por Criterio de Aceptacion

| HU | CA | Descripcion | Cubierto Por |
|----|-----|-------------|-------------|
| HU-001 | CA1 | Formulario con foto, parentesco, nombre, descripcion, audio | `gestion.cy.ts` |
| HU-001 | CA2 | Guardar en BD Supabase | `gestion.cy.ts` |
| HU-001 | CA3 | Editar/desactivar familiar existente | `gestion.cy.ts` |
| HU-002 | CA1 | Card muestra foto + icono parentesco | `FamiliarCard.test.tsx` |
| HU-002 | CA2 | Nombre visible solo si configurado | `FamiliarCard.test.tsx` |
| HU-002 | CA3 | Excluir familiares sin foto | `FamiliarCard.test.tsx` |
| HU-003 | CA1 | Tap en card abre modal con foto grande | `galeria.cy.ts` |
| HU-003 | CA2 | Modal muestra nombre + parentesco | `galeria.cy.ts` |
| HU-003 | CA3 | Modal muestra descripcion si existe | `galeria.cy.ts` |
| HU-003 | CA4 | Audio en modal bajo accion usuario | `useAudioPlayer.test.ts` |
| HU-004 | CA1 | Pantalla inicial con boton "Iniciar" | `MiniJuegoBoard.test.tsx`, `minijuego.cy.ts` |
| HU-004 | CA2 | Muestra foto de familiar aleatorio | `MiniJuegoBoard.test.tsx` |
| HU-005 | CA1 | Acepta respuesta correcta | `normalizarTexto.test.ts`, `MiniJuegoBoard.test.tsx` |
| HU-005 | CA2 | Rechaza respuesta incorrecta | `MiniJuegoBoard.test.tsx` |
| HU-005 | CA3 | Normaliza: trim, case, tildes | `normalizarTexto.test.ts` |
| HU-006 | CA1 | Respuesta incorrecta sube nivel de ayuda | `MiniJuegoBoard.test.tsx` |
| HU-006 | CA2 | Nivel 1: solo foto | Implicito en logica |
| HU-006 | CA3 | Nivel 2: + nombre | Implicito en logica |
| HU-006 | CA4 | Nivel 3: + descripcion | `MiniJuegoBoard.test.tsx` |
| HU-006 | CA5 | Nivel 4: + audio | `MiniJuegoBoard.test.tsx` |
| HU-007 | CA1 | Boton de reproduccion de audio | `useAudioPlayer.test.ts` |
| HU-007 | CA2 | Audio solo bajo accion usuario | `useAudioPlayer.test.ts`, `minijuego.cy.ts` |
| HU-008 | CA1 | Puntos segun nivel de ayuda | `puntuacion.test.ts`, `MiniJuegoBoard.test.tsx` |
| HU-008 | CA2 | Puntaje visible en UI | `minijuego.cy.ts` |
| HU-009 | CA1 | Felicitacion + puntaje final | `PantallaFin.test.tsx` |
| HU-009 | CA2 | Indicador visual (estrellas) | `PantallaFin.test.tsx` |
| HU-009 | CA3 | Botones: reiniciar + ver galeria | `PantallaFin.test.tsx` |
| HU-010 | CA1 | Sesion persiste en Supabase | `metricas.cy.ts` |
| HU-010 | CA2 | Rondas persisten en Supabase | `metricas.cy.ts` |
| HU-011 | CA1 | Total sesiones, puntaje, % aciertos | `metricas.cy.ts` |
| HU-011 | CA2 | Tabla familiares por dificultad | `metricas.cy.ts` |

---

## 9. Pruebas de Regresion

Las pruebas de regresion verifican que la funcionalidad existente NO se ha roto:

| Area | Verificacion | Metodo |
|------|-------------|--------|
| Login/Registro | Flujo de autenticacion funciona | Manual + E2E existentes |
| Dashboard Paciente | Carga correctamente con nuevos botones | Manual |
| Dashboard Cuidador | Carga correctamente con nuevas opciones | Manual |
| Dashboard Medico | Carga correctamente con nuevo tab | Manual |
| Sesiones existentes | CRUD de sesiones de descripcion | E2E existentes |
| Navegacion general | Rutas existentes no afectadas | Manual |

---

## 10. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Supabase Storage no configurado | Media | Alto | Crear buckets antes de tests |
| RLS policies bloquean operaciones | Alta | Alto | Configurar policies permisivas en dev |
| Cypress timeout en carga | Baja | Medio | Aumentar timeout en cypress.config |
| Tests fallando por mock insuficiente | Media | Medio | Usar mocks que simulan logica real |

---

## 11. Definition of Done (DoD)

Para considerar la feature como COMPLETA:

- [x] Codigo implementado para las 11 HUs
- [x] Tests unitarios creados (7 archivos)
- [x] Tests de componentes creados (3 archivos)
- [x] Tests E2E creados (4 archivos)
- [x] Navegacion integrada en dashboards (paciente, cuidador, medico)
- [x] Plan de pruebas documentado
- [ ] Todos los tests unitarios pasan (ejecutar `npm test`)
- [ ] Todos los tests E2E pasan (ejecutar `npx cypress run`)
- [ ] Revision de codigo completada
- [ ] Buckets de Supabase Storage creados
- [ ] RLS Policies configuradas
- [ ] Video demo grabado
- [ ] Version bumped a 0.2.0

---

## 12. Apendice: Estructura de Archivos de la Feature

```
src/
  types/
    familiares.types.ts          # Tipos, interfaces, constantes
  services/
    familiar.service.ts          # CRUD Supabase
    minijuego.service.ts         # Sesiones/Rondas Supabase
  hooks/
    use-minijuego.ts             # Estado del juego
    use-audio-player.ts          # Reproduccion de audio
  components/
    familiares/
      index.ts                   # Barrel export
      FamiliarCard.tsx           # Card individual
      FamiliarGallery.tsx        # Grid de cards
      RecuerdoModal.tsx          # Modal de detalle
      MiniJuegoBoard.tsx         # Tablero del juego
      PantallaFin.tsx            # Pantalla de fin
      FamiliarCRUD.tsx           # Gestion CRUD
      MetricasDashboard.tsx      # Dashboard metricas
  app/
    familiares/
      gallery/page.tsx           # /familiares/gallery
      minijuego/page.tsx         # /familiares/minijuego
      gestion/page.tsx           # /familiares/gestion
      metricas/page.tsx          # /familiares/metricas
  __tests__/
    familiares/
      familiares.types.test.ts   # Tests tipos
      normalizarTexto.test.ts    # Tests normalizacion
      puntuacion.test.ts         # Tests puntuacion
      useAudioPlayer.test.ts     # Tests audio
      FamiliarCard.test.tsx      # Tests card
      MiniJuegoBoard.test.tsx    # Tests juego
      PantallaFin.test.tsx       # Tests fin
  cypress/
    e2e/
      familiares/
        galeria.cy.ts            # E2E galeria
        minijuego.cy.ts          # E2E mini-juego
        gestion.cy.ts            # E2E CRUD
        metricas.cy.ts           # E2E metricas
```
