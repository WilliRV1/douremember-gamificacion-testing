#!/bin/bash

# Script to create test accounts for gamification testing
API_URL="http://localhost:3000/api/usuarios-autenticacion"

echo "🔄 Creando cuentas de test..."

# Doctor account
echo "👨‍⚕️ Creando doctor..."
DOCTOR=$(curl -s -X POST "${API_URL}/crearUsuario" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "password": "Doctor123!",
    "nombre": "Dr. Carlos",
    "apellido": "García",
    "tipo_usuario": "doctor"
  }')
DOCTOR_ID=$(echo $DOCTOR | jq -r '.id // .user.id' 2>/dev/null || echo "")
echo "Doctor creado: $DOCTOR_ID"
echo $DOCTOR | jq '.'

# Patient account
echo -e "\n👨‍🦳 Creando paciente..."
PATIENT=$(curl -s -X POST "${API_URL}/crearUsuario" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@test.com",
    "password": "Paciente123!",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipo_usuario": "paciente"
  }')
PATIENT_ID=$(echo $PATIENT | jq -r '.id // .user.id' 2>/dev/null || echo "")
echo "Paciente creado: $PATIENT_ID"
echo $PATIENT | jq '.'

# Caregiver account
echo -e "\n👩‍🦱 Creando cuidador..."
CAREGIVER=$(curl -s -X POST "${API_URL}/crearUsuario" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cuidador@test.com",
    "password": "Cuidador123!",
    "nombre": "María",
    "apellido": "López",
    "tipo_usuario": "cuidador"
  }')
CAREGIVER_ID=$(echo $CAREGIVER | jq -r '.id // .user.id' 2>/dev/null || echo "")
echo "Cuidador creado: $CAREGIVER_ID"
echo $CAREGIVER | jq '.'

echo -e "\n✅ Cuentas creadas!"
echo "Doctor: doctor@test.com / Doctor123!"
echo "Paciente: paciente@test.com / Paciente123!"
echo "Cuidador: cuidador@test.com / Cuidador123!"

echo -e "\nIDs para testing:"
echo "DOCTOR_ID: $DOCTOR_ID"
echo "PATIENT_ID: $PATIENT_ID"
echo "CAREGIVER_ID: $CAREGIVER_ID"
