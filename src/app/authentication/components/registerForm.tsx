"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

// NOTA: La dependencia a apiService ha sido eliminada.
// La lógica de fetch de las funciones necesarias se ha movido
// a las nuevas funciones locales `verificarInvitacion` y `completarRegistro`.

// =============================================
// CONFIGURACIÓN DE API
// =============================================
// Usar la misma lógica de URL base que en apiService
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.devcorebits.com';
const USER_AUTH_ENDPOINT = `${API_URL}/api/usuarios-autenticacion`;

// =============================================
// TIPOS
// =============================================
interface FormData {
  name: string;
  email: string;
  role: string;
  fechaNacimiento?: string;
  password: string;
  confirmPassword: string;
  idMedico: string | null; // Se actualiza para permitir 'null'
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  fechaNacimiento?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface InputProps {
  label: string;
  type: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
  disabled: boolean;
}

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline";
  onClick?: () => void;
  disabled: boolean;
  className?: string;
  children: React.ReactNode;
}

// =============================================
// FUNCIONES DE API MOVIDAS/ADAPTADAS
// =============================================

/**
 * Función local para verificar el token de invitación (adaptada de apiService.verificarInvitacion)
 */
async function verificarInvitacion(token: string) {
  try {
    console.log('🔍 Verificando token de invitación...');

    const response = await fetch(
      `${USER_AUTH_ENDPOINT}/verificarToken?token=${token}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token inválido o expirado');
    }

    const data = await response.json();
    console.log('✅ Token válido:', data);

    // FIX 1: Usar 'null' en lugar de 'undefined' cuando no hay idMedico
    const idMedicoValue = data.invitacion.idMedico || null;
    console.log("Id médico asociado (null o string):", idMedicoValue);

    // El backend devuelve: { ok, message, invitacion: { id, correo, nombreCompleto, rol, idMedico } }
    return {
      email: data.invitacion.correo,
      rol: data.invitacion.rol,
      nombreCompleto: data.invitacion.nombreCompleto,
      idMedico: idMedicoValue
    };

  } catch (error: any) {
    console.error('❌ Error en verificarInvitacion:', error);
    throw new Error(error.message || 'Error al verificar invitación');
  }
}

/**
 * Función local para completar el registro (adaptada de apiService.completarRegistroConInvitacion)
 */
async function completarRegistro(data: {
  nombre: string;
  correo: string;
  contrasenia: string;
  rol: string;
  fechaNacimiento?: string;
  idMedico: string | null; // Se espera que sea un string o null
}): Promise<any> {
  try {
    console.log('📝 Completando registro con invitación...')

    // FIX 2: Simplificar la construcción del payload para incluir idMedico directamente,
    // que será 'null' o un 'string' según la invitación.
    const payload: any = {
      nombre: data.nombre,
      correo: data.correo,
      contrasenia: data.contrasenia,
      rol: data.rol,
      status: 'activo',
      // Incluir idMedico. Será null para médicos/cuidadores y el ID para pacientes.
      idMedico: data.idMedico
    }
    
    // Incluir fechaNacimiento solo si existe, aunque la validación del frontend lo hace obligatorio.
    if (data.fechaNacimiento) {
      payload.fechaNacimiento = data.fechaNacimiento;
    }

    console.log('Payload final para el registro:', payload);

    const response = await fetch(
      `${USER_AUTH_ENDPOINT}/crearUsuario`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al completar el registro');
    }

    const result = await response.json();
    console.log('✅ Registro completado:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Error en completarRegistroConInvitacion:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(errorMessage || 'Error al completar el registro');
  }
}

// =============================================
// COMPONENTES AUXILIARES
// =============================================

const Input = ({
  label,
  type,
  icon: Icon,
  value,
  onChange,
  error,
  placeholder,
  disabled
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${type === 'password' ? 'pr-12' : 'pr-4'} py-2.5 text-gray-900 font-medium placeholder:text-slate-400 border ${error ? 'border-red-500' : 'border-slate-300'
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        />

        {/* Botón toggle para contraseña */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-600 transition-colors focus:outline-none"
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

const Button = ({
  type = "button",
  variant = "primary",
  onClick,
  disabled,
  className = "",
  children
}: ButtonProps) => {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    outline: "bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function Register() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const [estado, setEstado] = useState<"verificando" | "ok" | "invalido">("verificando");
  const [invitacionData, setInvitacionData] = useState<{
    email: string;
    rol: string;
    nombreCompleto: string;
    idMedico: string | null; // Se actualiza para ser string o null
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    idMedico: null, // Inicializar como null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // =============================================
  // EFECTO: VERIFICAR TOKEN AL CARGAR
  // =============================================
  useEffect(() => {
    // NOTA: Si hay token, verificar invitación. Si no, permitir registro directo
    if (!token) {
      console.log('⚠️ Sin token de invitación - permitiendo registro directo');
      setEstado("ok");
      return;
    }

    const checkToken = async () => {
      try {
        console.log('🔍 Verificando token...');

        // **USO DE LA FUNCIÓN LOCAL VERIFICARINVITACION**
        const data = await verificarInvitacion(token);

        console.log("✅ Invitación válida:", data);
        console.log("ID Médico asociado (string o null):", data.idMedico);

        setInvitacionData(data);

        setFormData(prev => ({
          ...prev,
          name: data.nombreCompleto || "",
          email: data.email || "",
          role: data.rol || "",
          idMedico: data.idMedico, // Ahora será string o null
        }));

        console.log("formData con el idMedico", data.idMedico);

        setEstado("ok");

      } catch (error: any) {
        console.error('❌ Error al verificar token:', error);
        // No fallo - permitir registro directo de todas formas
        setEstado("ok");
      }
    };

    checkToken();
  }, [token]);

  // =============================================
  // FUNCIONES DE VALIDACIÓN
  // =============================================
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Información personal";
      case 2: return "Selección de rol";
      case 3: return "Seguridad";
      default: return "";
    }
  };

  const validateStep = () => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "El nombre es requerido";
      }
      if (!formData.email.trim()) {
        newErrors.email = "El correo es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Correo electrónico inválido";
      }

      if (!formData.fechaNacimiento) {
        newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";

      } else {
        const fechaNac = new Date(formData.fechaNacimiento);
        const hoy = new Date();
        //validar que no sea fecha futura
        if (fechaNac > hoy) {
          newErrors.fechaNacimiento = "La fecha de nacimiento no puede ser futura";
        } else {
          let edad = hoy.getFullYear() - fechaNac.getFullYear();
          const mesActual = hoy.getMonth();
          const mesNacimiento = fechaNac.getMonth();
          //ajustar edad si no ha cumplido años este año
          if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
            edad--;
          }
          //Valirdar que sea mayor de 18 años
          if (edad < 18) {
            newErrors.fechaNacimiento = "Debes ser mayor de 18 años";
          }
        }
      }
    }

    if (currentStep === 2) {
      // El rol ya está precargado y deshabilitado, pero mantenemos la validación por si acaso.
      if (!formData.role) {
        newErrors.general = "Debes seleccionar un rol";
      }
    }

    if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = "La contraseña es requerida";
      } else if (formData.password.length < 10) {
        newErrors.password = "Mínimo 10 caracteres";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Debe incluir una mayúscula";
      } else if (!/[!@#$%^&*]/.test(formData.password)) {
        newErrors.password = "Debe incluir un símbolo";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================
  // HANDLERS
  // =============================================
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('📝 Enviando registro...');
      console.log("Id médico en formData", formData.idMedico);

      const registroPayload: any = {
        nombre: formData.name,
        fechaNacimiento: formData.fechaNacimiento,
        status: 'activo',
        correo: formData.email,
        contrasenia: formData.password,
        rol: formData.role,
        idMedico: formData.idMedico,
      }

      // **USO DE LA FUNCIÓN LOCAL COMPLETARREGISTRO**
      await completarRegistro(registroPayload);

      console.log('✅ Registro completado exitosamente');

      setSuccess(true);

      setTimeout(() => {
        router.push("/authentication/login");
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error al completar registro:', error);
      // Asegurar que el error sea un string
      const errorMessage = error instanceof Error ? error.message : "Error al crear la cuenta";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================
  // RENDERIZADO: VERIFICANDO
  // =============================================
  if (estado === "verificando") {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div
          className="hidden lg:block relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/medicaIndividual.jpg')" }}
        />

        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-indigo-800">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-800 text-lg font-medium">Verificando invitación...</p>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // RENDERIZADO: INVITACIÓN INVÁLIDA
  // =============================================
  if (estado === "invalido") {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div
          className="hidden lg:block relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/medicaIndividual.jpg')" }}
        />

        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-indigo-800">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Invitación Inválida</h2>
            <p className="text-slate-600 mb-6">
              El enlace de invitación no es válido o ha expirado.
            </p>
            <Button
              onClick={() => router.push("/")}
              disabled={false}
              className="w-full"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // RENDERIZADO: FORMULARIO DE REGISTRO
  // =============================================
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Sección de imagen - lado izquierdo */}
      <div
        className="hidden lg:block relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/medicaIndividual.jpg')" }}
      />

      {/* Sección de formulario - lado derecho */}
      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-indigo-800">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Completa tu Registro
            </h2>
            <p className="text-slate-600">Paso {currentStep} de {totalSteps}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    step <= currentStep ? "bg-purple-600" : "bg-slate-300"
                  )}
                />
              ))}
            </div>
            <p className="text-center text-sm text-slate-600 mt-2 font-medium">
              {getStepTitle()}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">¡Cuenta creada exitosamente!</p>
                <p className="text-green-700 text-sm mt-1">Redirigiendo al login...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && !success && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form Steps */}
          <div className="space-y-5">

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <Input
                  label="Nombre completo"
                  type="text"
                  icon={User}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      const newErrors = { ...errors };
                      delete newErrors.name;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.name}
                  placeholder="Juan Pérez"
                  disabled={isLoading || success}
                />

                <Input
                  label="Correo electrónico"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      const newErrors = { ...errors };
                      delete newErrors.email;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.email}
                  placeholder="tu@correo.com"
                  disabled={isLoading || success || !!invitacionData}
                />

                <Input
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.fechaNacimiento || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, fechaNacimiento: e.target.value });
                    if (errors.fechaNacimiento) {
                      const newErrors = { ...errors };
                      delete newErrors.fechaNacimiento;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.fechaNacimiento}
                  placeholder="Selecciona tu fecha de nacimiento"
                  disabled={isLoading || success}
                />
              </div>
            )}

            {/* Step 2: Role Selection */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Tu rol en la plataforma
                  </label>

                  {/* Permitir seleccionar rol */}
                  <div className="space-y-2">
                    {[
                      { value: 'doctor', label: 'Médico', desc: 'Acompaña el proceso' },
                      { value: 'cuidador', label: 'Cuidador', desc: 'Sube los recuerdos' },
                      { value: 'paciente', label: 'Paciente', desc: 'Recibo la terapia' },
                    ].map((role) => (
                      <div
                        key={role.value}
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        className={cn(
                          "p-4 border-2 rounded-lg cursor-pointer transition-all",
                          formData.role === role.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            formData.role === role.value ? 'bg-purple-600' : 'bg-slate-300'
                          )}>
                            <User className={cn(
                              "w-5 h-5",
                              formData.role === role.value ? 'text-white' : 'text-slate-600'
                            )} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {role.label}
                            </div>
                            <div className="text-sm text-slate-600">
                              {role.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <Input
                  label="Contraseña"
                  type="password"
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      const newErrors = { ...errors };
                      delete newErrors.password;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.password}
                  placeholder="••••••••"
                  disabled={isLoading || success}
                />

                <Input
                  label="Confirmar contraseña"
                  type="password"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) {
                      const newErrors = { ...errors };
                      delete newErrors.confirmPassword;
                      setErrors(newErrors);
                    }
                  }}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  disabled={isLoading || success}
                />

                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                  <p className="font-medium mb-1">La contraseña debe tener:</p>
                  <ul className="space-y-1 pl-4">
                    <li className="list-disc">Mínimo 10 caracteres</li>
                    <li className="list-disc">Una letra mayúscula</li>
                    <li className="list-disc">Un símbolo (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading || success}
                className="flex-1"
              >
                Atrás
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading || success}
                className="flex-1"
              >
                Continuar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || success}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creando cuenta...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    ¡Cuenta creada!
                  </>
                ) : (
                  "Completar Registro"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 