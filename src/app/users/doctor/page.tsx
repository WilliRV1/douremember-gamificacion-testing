"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { SearchBar } from "@/components/search-bar"
import { AssociatedUsers } from "@/components/associated-users"
import InviteUserModal from "@/app/components/invitations/invitationModal"
import { AssignCaregiverModal } from "@/components/assign-caregiver-modal"
import { QuickStats } from "@/components/quick-stats"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserPlus, FileText, LogOut, Users, Activity, User, BarChart3 } from "lucide-react"

import BaselineReportsModule from "@/app/components/reports/BaseLineReportsModule"
import BaselineReportsStats from "@/app/components/reports/BaseLineReportsStats"

// Asegúrate de que API_URL se esté cargando correctamente en tu entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Patient {
    idUsuario: string
    nombre: string
    correo: string
    fechaNacimiento?: string
    status: string
}

interface Caregiver {
    idUsuario: string
    nombre: string
    correo: string
    fechaNacimiento?: string
    status: string
}

export default function DoctorPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [allCaregivers, setAllCaregivers] = useState<Caregiver[]>([])
    // ✅ CLAVE: isLoading inicializado en TRUE para bloquear render inicial
    const [isLoading, setIsLoading] = useState<boolean>(true) 
    const [doctorName, setDoctorName] = useState<string>("")
    const [doctorId, setDoctorId] = useState<string>("")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [activeView, setActiveView] = useState<"patients" | "reports" | "minijuego">("patients")
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const router = useRouter()

    
    // --- FUNCIÓN loadData ---
    const loadData = async (idMedico: string) => {
        try {
            // 🔥 MODO TESTING: Usar datos dummy en lugar de obtenerlos del backend
            const dummyPatients = [
                {
                    idUsuario: '7165f511-c999-46a7-881c-755fc3e61510',
                    nombre: 'Juan Pérez',
                    correo: 'paciente@douremember.app',
                    status: 'activo'
                }
            ]
            setPatients(dummyPatients)

            // 🔥 MODO TESTING: Usar cuidadores dummy
            const dummyCaregivers = [
                {
                    idUsuario: '892c4a2f-b555-4bdd-9fac-db16a4f1d3cc',
                    nombre: 'María López',
                    correo: 'cuidador@douremember.app',
                    status: 'activo'
                }
            ]
            setAllCaregivers(dummyCaregivers)
        } catch (error) {
             // Manejo de error de sesión, limpia y redirige
            if (error instanceof Error && error.message.includes("Token expirado")) {
                console.error("🚨 Redirigiendo por token expirado en loadData:", error)
                localStorage.clear()
                sessionStorage.clear()
                router.replace("/authentication/login")
                return
            }
            console.error("❌ Error en loadData:", error)
        } 
    }


    // --- useEffect: Verificación de Sesión ---
    useEffect(() => {
        const initializeData = async () => {
            console.log("🔍 Inicializando datos y verificando sesión...")

            const token = localStorage.getItem("authToken")
            const idMedico = localStorage.getItem("userId")

            // --- BLOQUEO INMEDIATO (Si no hay token/ID en localStorage) ---
            if (!token || !idMedico) {
                console.warn("⚠️ No hay token o ID de usuario. Redirigiendo inmediatamente.")

                localStorage.clear()
                sessionStorage.clear()

                router.replace("/authentication/login")
                setIsLoading(false)
                return
            }
            // --- FIN BLOQUEO INMEDIATO ---

            setDoctorId(idMedico)

            if (!API_URL) {
                console.error("❌ API_URL no está definido. Revisa tu archivo .env.local")
                setIsLoading(false)
                return
            }

            try {
                // 🔥 MODO TESTING: Usar datos del localStorage
                const doctorName = localStorage.getItem('userName') || 'Doctor'
                const userRole = localStorage.getItem('userRole')

                if (userRole !== 'medico') {
                    alert("Acceso restringido: esta cuenta no es de médico.")
                    localStorage.clear()
                    sessionStorage.clear()
                    router.replace("/authentication/login")
                    return
                }

                // ✅ Guardamos info del doctor
                setDoctorName(doctorName)
                setDoctorId(idMedico)

                // ✅ Cargamos datos relacionados
                await loadData(idMedico)

            } catch (error) {
                console.error("🚨 Error al inicializar datos:", error)
            } finally {
                setIsLoading(false) // Esto se ejecuta al final de la carga exitosa o fallida
            }
        }

        initializeData()
    }, [router])


    // --- Lógica de Logout ---
    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            // Limpiar ambos por seguridad
            localStorage.clear()
            sessionStorage.clear()
            
            // Limpieza de cookies (opcional)
            document.cookie.split(";").forEach((cookie) => {
                const eqPos = cookie.indexOf("=")
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            })
            window.location.href = "/authentication/login"
        } catch (error) {
            console.error("Error inesperado al cerrar sesión:", error)
            window.location.href = "/authentication/login"
        } finally {
            setIsLoggingOut(false)
        }
    }

    const handleViewProfile = () => router.push("/users/profile")
    
    const handleInviteSuccess = () => {
        console.log("✅ Usuario invitado exitosamente")
        setRefreshKey((prev) => prev + 1)
        loadData(doctorId)
    }

    const handleAssignSuccess = () => {
        console.log("✅ Cuidador asignado exitosamente")
        setRefreshKey((prev) => prev + 1)
        loadData(doctorId)
    }

    // --- RENDER CONDICIONAL DE CARGA ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                <p className="mt-4 text-purple-700 font-medium">Cargando panel médico...</p>
            </div>
        )
    }

    // --- RENDERIZADO PRINCIPAL (Si isLoading es false) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-purple-200 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <DashboardHeader />
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <div className="space-y-8">
                    <Card className="bg-gradient-to-r from-purple-700 via-purple-800 to-violet-900 border-0 shadow-2xl overflow-hidden">
                        <div className="p-6 sm:p-10">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-20 h-20 rounded-2xl bg-white/30 flex items-center justify-center border-2 border-white/60 shadow-lg ring-4 ring-white/25">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl || "/placeholder.svg"}
                                                    alt="Doctor"
                                                    className="w-full h-full rounded-2xl object-cover"
                                                />
                                            ) : (
                                                <Activity className="w-10 h-10 text-white" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                                            Hola, Dr. {doctorName || "Doctor"}
                                        </h1>
                                        <p className="text-white/90 text-base font-medium">
                                            Bienvenido a tu panel de gestión médica
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        onClick={handleViewProfile}
                                        className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm shadow-md hover:shadow-lg font-semibold"
                                    >
                                        <User className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Mi Perfil</span>
                                    </Button>

                                    <Button
                                        onClick={() => setIsInviteModalOpen(true)}
                                        className="bg-white hover:bg-gray-50 text-purple-700 shadow-md font-bold"
                                        disabled={isLoggingOut}
                                    >
                                        <UserPlus className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Invitar Usuario</span>
                                    </Button>

                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        className="bg-white/15 border-2 border-white/50 text-white hover:bg-red-500 hover:border-red-500"
                                        disabled={isLoggingOut}
                                    >
                                        <LogOut className="w-4 h-4 sm:mr-2" />
                                        {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                        <div className="space-y-6">
                            <Card className="p-2 bg-white shadow-sm border border-purple-200 rounded-2xl">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveView("patients")}
                                        className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2.5 ${activeView === "patients"
                                                ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg"
                                                : "text-purple-600 hover:bg-purple-50"
                                            }`}
                                    >
                                        <Users className="w-5 h-5" />
                                        Pacientes
                                    </button>

                                    <button
                                        onClick={() => setActiveView("reports")}
                                        className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2.5 ${activeView === "reports"
                                                ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg"
                                                : "text-purple-600 hover:bg-purple-50"
                                            }`}
                                    >
                                        <FileText className="w-5 h-5" />
                                        Reportes Base
                                    </button>

                                    <button
                                        onClick={() => setActiveView("minijuego")}
                                        className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2.5 ${activeView === "minijuego"
                                                ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg"
                                                : "text-purple-600 hover:bg-purple-50"
                                            }`}
                                    >
                                        <BarChart3 className="w-5 h-5" />
                                        Mini-juego
                                    </button>
                                </div>
                            </Card>

                            {activeView === "patients" ? (
                                <div className="space-y-6">
                                    <AssociatedUsers
                                        key={`patients-${refreshKey}`}
                                        patients={patients}
                                    />
                                </div>
                            ) : activeView === "reports" ? (
                                <div className="space-y-6">
                                    <BaselineReportsModule key={`reports-${refreshKey}`} />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <Card className="bg-white border border-slate-100 shadow-lg rounded-2xl p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg">
                                                <BarChart3 className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Métricas del Mini-juego Familiar</h2>
                                                <p className="text-slate-600">Seleccione un paciente para ver su progreso en el mini-juego de reconocimiento</p>
                                            </div>
                                        </div>

                                        {patients.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-500">No hay pacientes asignados</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {patients.map((patient) => (
                                                    <button
                                                        key={patient.idUsuario}
                                                        onClick={() => router.push(`/familiares/metricas?pacienteId=${patient.idUsuario}&nombre=${encodeURIComponent(patient.nombre)}`)}
                                                        className="group flex items-center gap-4 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl hover:from-pink-50 hover:to-pink-100 transition-all duration-300 border-2 border-slate-200 hover:border-pink-300 hover:shadow-lg text-left"
                                                    >
                                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                                            <User className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{patient.nombre}</p>
                                                            <p className="text-sm text-slate-500">Ver métricas del mini-juego</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            )}
                        </div>

                        <div className="lg:sticky lg:top-28 h-fit space-y-6">
                            {activeView === "reports" && (
                                <BaselineReportsStats key={`stats-${refreshKey}`} />
                            )}
                            <QuickStats key={`quickstats-${refreshKey}`} />
                        </div>
                    </div>
                </div>
            </div>

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={handleInviteSuccess}
            />

            <AssignCaregiverModal
                open={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSuccess={handleAssignSuccess}
                patients={patients}
                caregivers={allCaregivers}
            />
        </div>
    )
}