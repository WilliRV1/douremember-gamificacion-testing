/**
 * Servicio de Autenticación con Supabase
 * Maneja login, logout, sesión y roles de usuario
 */

import { createClient } from '@/utils/supabase/client'

export interface UserSession {
  userId: string
  email: string
  rol: string
  nombre: string
  edad?: number
  accessToken?: string
}

export interface CreateUserDto {
  nombre: string
  correo: string
  contrasenia: string
  rol?: 'medico' | 'paciente' | 'cuidador' | 'administrador'
  edad?: number
  status?: string
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.devcorebits.com'

class AuthService {
  private supabase = createClient()
  private currentSession: UserSession | null = null

  /**
   * Registrar nuevo usuario
   */
  async signUp(data: CreateUserDto) {
    try {
      console.log('📝 Registrando usuario...')
      
      const response = await fetch(`${API_URL}/api/usuarios-autenticacion/crearUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear usuario')
      }

      const result = await response.json()
      console.log('✅ Usuario creado:', result)
      return result
      
    } catch (error: any) {
      console.error('❌ Error en signUp:', error)
      throw error
    }
  }

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<UserSession> {
    try {
      console.log('🔐 Iniciando login...')
      console.log('📧 Email:', email)
      
      // PASO 1: Primero autenticar en Supabase para obtener el user_id
      const { data: supabaseData, error: supabaseError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (supabaseError || !supabaseData.session) {
        console.error('❌ Error en Supabase:', supabaseError)
        throw new Error('Credenciales inválidas')
      }

      const userId = supabaseData.user.id
      const accessToken = supabaseData.session.access_token

      console.log('Autenticación Supabase exitosa')
      console.log('User ID:', userId)
      console.log('Access Token obtenido')

      console.log('Buscando perfil del usuario...')
      
      const userResponse = await fetch(
      `${API_URL}/api/usuarios-autenticacion/buscarUsuario/${userId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        }
      }
    )
      

      console.log('User response status:', userResponse.status)

      const userData = await userResponse.json()
      console.log('👤 User data completo:', userData)
      
      const usuario = userData.usuarios?.[0]
      
      if (!usuario) {
        throw new Error('No se encontró el perfil del usuario')
      }

      console.log('🔑 ROL del usuario:', usuario.rol)
      console.log('👤 Nombre del usuario:', usuario.nombre)

      const session: UserSession = {
        userId,
        email: usuario.correo || email,
        rol: usuario.rol,
        nombre: usuario.nombre,
        edad: usuario.edad,
        accessToken
      }

      this.currentSession = session
      console.log('✅ Sesión creada:', session)
      console.log('🎉 Login completado exitosamente!')
      
      return session
      
    } catch (error: any) {
      console.error('💥 Error en login:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await this.supabase.auth.signOut()
      this.currentSession = null
      // Limpiar también localStorage (testing mode)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userName')
      }
      console.log('✅ Sesión cerrada')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
      throw error
    }
  }

  /**
   * Obtener sesión actual
   */
  async getSession(): Promise<UserSession | null> {
    try {
      // Si ya tenemos sesión en memoria, devolverla
      if (this.currentSession) {
        return this.currentSession
      }

      // 🔥 TESTING MODE: Verificar localStorage antes de Supabase
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken')
        const userId = localStorage.getItem('userId')
        const userRole = localStorage.getItem('userRole')
        const userName = localStorage.getItem('userName')

        if (token && userId && userRole) {
          const testSession: UserSession = {
            userId,
            email: '',
            rol: userRole,
            nombre: userName || 'Usuario',
            accessToken: token,
          }
          this.currentSession = testSession
          return testSession
        }
      }

      const { data: { session } } = await this.supabase.auth.getSession()
      
      if (!session) {
        console.log('❌ No hay sesión en Supabase')
        return null
      }

      console.log('✅ Sesión encontrada en Supabase')
      
      // Obtener datos actualizados del backend
      try {
        const userResponse = await fetch(
          `${API_URL}/api/usuarios-autenticacion/buscarUsuario/${session.user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (userResponse.ok) {
          const userData = await userResponse.json()
          const usuario = userData.usuarios?.[0]
          
          if (usuario) {
            const userSession: UserSession = {
              userId: session.user.id,
              email: usuario.correo || session.user.email || '',
              rol: usuario.rol,
              nombre: usuario.nombre,
              edad: usuario.edad,
              accessToken: session.access_token
            }
            
            this.currentSession = userSession
            return userSession
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del backend:', error)
      }

      // Fallback: usar datos de Supabase
      const fallbackSession: UserSession = {
        userId: session.user.id,
        email: session.user.email || '',
        rol: session.user.user_metadata?.rol || 'paciente',
        nombre: session.user.user_metadata?.nombre || 'Usuario',
        edad: session.user.user_metadata?.edad,
        accessToken: session.access_token
      }
      
      this.currentSession = fallbackSession
      return fallbackSession
    } catch (error) {
      console.error('Error al obtener sesión:', error)
      return null
    }
  }

  /**
   * Obtener token de acceso (MÉTODO SÍNCRONO)
   */
  getAccessToken(): string | null {
    return this.currentSession?.accessToken || null
  }

  /**
   * Obtener token de acceso (MÉTODO ASÍNCRONO)
   */
  async getAccessTokenAsync(): Promise<string | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      return null
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return session !== null
  }

  /**
   * Obtener rol del usuario actual
   */
  async getUserRole(): Promise<string | null> {
    const session = await this.getSession()
    return session?.rol || null
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  async hasRole(role: string): Promise<boolean> {
    const userRole = await this.getUserRole()
    return userRole === role
  }

  /**
   * Verificar si el usuario es médico
   */
  async isDoctor(): Promise<boolean> {
    return await this.hasRole('medico')
  }

  /**
   * Verificar si el usuario es paciente
   */
  async isPatient(): Promise<boolean> {
    return await this.hasRole('paciente')
  }

  /**
   * Verificar si el usuario es cuidador
   */
  async isCaregiver(): Promise<boolean> {
    return await this.hasRole('cuidador')
  }

  /**
   * Verificar si el usuario es administrador
   */
  async isAdmin(): Promise<boolean> {
    return await this.hasRole('administrador')
  }

  /**
   * Obtener información completa del usuario actual
   */
  async getCurrentUser(): Promise<UserSession | null> {
    return await this.getSession()
  }

  /**
   * Obtener ID del usuario actual
   */
  async getCurrentUserId(): Promise<string | null> {
    const session = await this.getSession()
    return session?.userId || null
  }

  /**
   * Obtener nombre del usuario actual
   */
  async getCurrentUserName(): Promise<string | null> {
    const session = await this.getSession()
    return session?.nombre || null
  }

  /**
   * Escuchar cambios en la autenticación
   */
  onAuthStateChange(callback: (session: UserSession | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userSession = await this.getSession()
        callback(userSession)
      } else {
        this.currentSession = null
        callback(null)
      }
    })
  }
}

// Exportar instancia única (Singleton)
export const authService = new AuthService()