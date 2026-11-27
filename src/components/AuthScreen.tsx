import React, { useState, useEffect } from 'react';
import { useConecta } from '../context/ConectaContext';
import { TipoDocumentoIdentidad, TipoUsuario } from '../types';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import {
  compressImageToDataUrl,
  readCertificateFile,
  readPersonVideoFile
} from '../utils/mediaUpload';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  CreditCard,
  Phone,
  User,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Home,
  Wrench
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const {
    iniciarSesion,
    registrarUsuario,
    correosPermitidos,
    esCorreoPermitido,
    setActiveTab,
    showAuthModal,
    setShowAuthModal
  } = useConecta();

  const [mode, setMode] = useState<'login' | 'register'>(
    showAuthModal === 'register' ? 'register' : 'login'
  );

  useEffect(() => {
    if (showAuthModal === 'register' || showAuthModal === 'login') {
      setMode(showAuthModal);
      setShowAuthModal(null);
    }
  }, [showAuthModal, setShowAuthModal]);

  // Single Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [offerRegisterEmail, setOfferRegisterEmail] = useState(false);

  // Registration state (includes verification media & initial compliance for new users)
  const [regTipoUsuario, setRegTipoUsuario] = useState<TipoUsuario>('AMBOS');
  const [regTipoDoc, setRegTipoDoc] = useState<TipoDocumentoIdentidad>('DNI');
  const [regDni, setRegDni] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRegion, setRegRegion] = useState<string>('Lima');
  const [regProvincia, setRegProvincia] = useState<string>('Lima');
  const [regDistrito, setRegDistrito] = useState<string>('Miraflores');
  const [regDireccion, setRegDireccion] = useState('');
  const [regEspecialidad, setRegEspecialidad] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRuc, setRegRuc] = useState('');
  const [regEmergNombre, setRegEmergNombre] = useState('');
  const [regEmergParentesco, setRegEmergParentesco] = useState('Familiar directo');
  const [regEmergTelefono, setRegEmergTelefono] = useState('');
  const [regDniFoto, setRegDniFoto] = useState<string | undefined>(undefined);
  const [regFotoPersona, setRegFotoPersona] = useState<string | undefined>(undefined);
  const [regVideoPersona, setRegVideoPersona] = useState<string | undefined>(undefined);
  const [regVideoNombre, setRegVideoNombre] = useState<string | undefined>(undefined);
  const [regCertUrl, setRegCertUrl] = useState<string | undefined>(undefined);
  const [regCertNombre, setRegCertNombre] = useState<string | undefined>(undefined);
  const [regMediaMsg, setRegMediaMsg] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  const loginEmailTrimmed = loginEmail.trim();
  const loginEmailIsPermitted = loginEmailTrimmed.includes('@') && esCorreoPermitido(loginEmailTrimmed);
  const regEmailTrimmed = regEmail.trim();
  const regEmailIsPermitted = regEmailTrimmed.includes('@') && esCorreoPermitido(regEmailTrimmed);

  const switchToRegisterWithEmail = (prefill?: string) => {
    if (prefill) {
      setRegEmail(prefill.trim().toLowerCase());
    }
    setRegError(null);
    setLoginError(null);
    setOfferRegisterEmail(false);
    setMode('register');
  };

  const handleImageUpload = async (
    file: File | undefined,
    onDone: (url: string) => void,
    onError: (msg: string) => void
  ) => {
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file);
      onDone(compressed);
    } catch (err: any) {
      onError(err?.message || 'Error al procesar la imagen.');
    }
  };

  const handleVideoUpload = async (
    file: File | undefined,
    onDone: (url: string, name: string, isSessionOnly: boolean) => void,
    onError: (msg: string) => void
  ) => {
    if (!file) return;
    try {
      const res = await readPersonVideoFile(file);
      onDone(res.url, res.fileName, res.isSessionOnly);
    } catch (err: any) {
      onError(err?.message || 'Error al procesar el video.');
    }
  };

  const handleCertUpload = async (
    file: File | undefined,
    onDone: (url: string, name: string, warning?: string) => void,
    onError: (msg: string) => void
  ) => {
    if (!file) return;
    try {
      const res = await readCertificateFile(file);
      onDone(res.url, res.fileName, res.warning);
    } catch (err: any) {
      onError(err?.message || 'Error al procesar el certificado.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setOfferRegisterEmail(false);

    const res = iniciarSesion(loginEmail, loginPass);
    if (!res.ok) {
      setLoginError(res.error || 'No se pudo iniciar sesión.');
      if (res.notRegistered) {
        setOfferRegisterEmail(true);
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regTipoDoc === 'DNI') {
      if (regDni.replace(/\D/g, '').length !== 8) {
        setRegError('El DNI debe tener exactamente 8 dígitos numéricos.');
        return;
      }
    } else if (regDni.trim().length < 6) {
      setRegError('El Carnet de Extranjería o Pasaporte debe tener entre 6 y 15 caracteres.');
      return;
    }

    if (regRuc.trim() && regRuc.replace(/\D/g, '').length !== 11) {
      setRegError('Si ingresas tu RUC de contratista independiente, debe tener exactamente 11 dígitos.');
      return;
    }
    if (regEmergTelefono.trim() && regEmergTelefono.replace(/\D/g, '').length < 7) {
      setRegError('Ingresa un número telefónico válido para tu contacto familiar de emergencia.');
      return;
    }

    if (regNombre.trim().length < 4) {
      setRegError('Ingresa tus nombres y apellidos completos.');
      return;
    }
    if (regTelefono.replace(/\D/g, '').length < 9) {
      setRegError('Ingresa un número celular válido de 9 dígitos para WhatsApp y llamadas.');
      return;
    }
    if (!regEmail.includes('@')) {
      setRegError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!esCorreoPermitido(regEmail)) {
      setRegError(
        `Correo no permitido. Usa un correo perteneciente a: ${correosPermitidos.join(', ')}.`
      );
      return;
    }
    if (regDireccion.trim().length < 5) {
      setRegError('Ingresa tu dirección exacta en el Perú.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const res = registrarUsuario({
      tipoDocumento: regTipoDoc,
      dni: regTipoDoc === 'DNI' ? regDni.replace(/\D/g, '') : regDni.trim().toUpperCase(),
      nombreCompleto: regNombre,
      telefonoWhatsapp: regTelefono,
      email: regEmail,
      region: regRegion,
      provincia: regProvincia,
      distrito: regDistrito,
      direccion: regDireccion,
      password: regPassword,
      especialidadPrincipal: regEspecialidad,
      tipoUsuario: regTipoUsuario,
      rucNumero: regRuc.replace(/\D/g, '') || undefined,
      emergenciaFamiliarNombre: regEmergNombre.trim() || undefined,
      emergenciaFamiliarParentesco: regEmergNombre.trim() ? regEmergParentesco : undefined,
      emergenciaFamiliarTelefono: regEmergTelefono.trim() || undefined,
      dniFotoUrl: regDniFoto,
      fotoPersonaUrl: regFotoPersona,
      videoPersonaUrl: regVideoPersona,
      videoPersonaNombre: regVideoNombre,
      certificadoOpcionalUrl: regCertUrl,
      certificadoOpcionalNombre: regCertNombre
    });
    if (!res.ok) {
      setRegError(res.error || 'No se pudo completar el registro.');
    }
  };

  return (
    <div className={`w-full mx-auto transition-all duration-200 ${mode === 'login' ? 'max-w-lg' : 'max-w-3xl'}`}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('catalogo')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-navy-950 font-bold text-xs rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la Página Principal (Catálogo)</span>
        </button>
        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          Inicio de sesión único y opcional
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Navy Header */}
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <img
            src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -right-10 -top-10 w-64 h-64 object-contain opacity-[0.10]"
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>TrabajaYa Perú · Acceso Único</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta de Usuario'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {mode === 'login'
                  ? 'Un solo inicio de sesión. El sistema detecta automáticamente si tu correo permitido pertenece a un Usuario o al Administrador Único.'
                  : 'Al crear tu cuenta, elige tu modalidad y sube tu DNI, foto de persona, video de presentación y certificado opcional.'}
              </p>
            </div>

            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border-2 border-amber-400/80 overflow-hidden shadow-xl shrink-0 flex items-center justify-center self-start sm:self-center p-1">
              <img
                src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
                alt="Trabaja Ya · Tu talento, nuestro compromiso"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {mode === 'login' ? (
            <>
              {/* Permitted Email Rules */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1.5">
                <span className="font-bold text-slate-800 block">
                  Correos / Dominios Permitidos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {correosPermitidos.map(regla => (
                    <span
                      key={regla}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px] font-bold text-navy-950"
                    >
                      {regla}
                    </span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Correo Electrónico Permitido *</span>
                    </label>
                    {loginEmailTrimmed.includes('@') && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          loginEmailIsPermitted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {loginEmailIsPermitted ? '✓ Permitido' : '✕ No permitido'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => {
                      setLoginEmail(e.target.value);
                      setLoginError(null);
                      setOfferRegisterEmail(false);
                    }}
                    placeholder="tu-correo@conectaoficios.pe o @gmail.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contraseña *</span>
                  </label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                    required
                  />
                </div>

                {loginError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-800 text-xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                    {offerRegisterEmail && (
                      <button
                        type="button"
                        onClick={() => switchToRegisterWithEmail(loginEmail)}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Registrar "{loginEmailTrimmed}" ahora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 font-bold text-sm rounded-xl shadow-md transition-all active:scale-99 flex items-center justify-center gap-2 text-white bg-navy-900 hover:bg-navy-950 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Ingresar a Mi Cuenta</span>
                </button>
              </form>

              {/* Inline link to register if not registered */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">¿Aún no tienes una cuenta registrada?</span>
                <button
                  type="button"
                  onClick={() => switchToRegisterWithEmail(loginEmail)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarme con Correo y DNI</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-navy-900 hover:text-amber-600 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Iniciar Sesión</span>
                </button>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                  Asigna permiso: USUARIO
                </span>
              </div>

              {/* User Type Selector: Cliente Hogar vs Persona de Oficio vs Ambos */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  ¿Cómo usarás TrabajaYa? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRegTipoUsuario('CLIENTE_HOGAR')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      regTipoUsuario === 'CLIENTE_HOGAR'
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/60'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Home className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="font-extrabold text-navy-950 block">Cliente / Hogar</span>
                    <span className="text-[11px] text-slate-600">
                      Publicar imprevistos con fotos y comparar costos.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegTipoUsuario('OFERTANTE_OFICIO')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      regTipoUsuario === 'OFERTANTE_OFICIO'
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/60'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="font-extrabold text-navy-950 block">Persona de Oficio</span>
                    <span className="text-[11px] text-slate-600">
                      Ofrecer servicios y cotizar reparación de imprevistos.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegTipoUsuario('AMBOS')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      regTipoUsuario === 'AMBOS'
                        ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300/60'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-600 mb-1" />
                    <span className="font-extrabold text-navy-950 block">Ambos Roles</span>
                    <span className="text-[11px] text-slate-600">
                      Publicar imprevistos en casa y ofrecer oficios.
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950 text-[11px]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Tu cuenta se registrará con permiso de <strong>Usuario</strong> y quedará lista para verificación del Administrador Único.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Documento de Identidad *
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={regTipoDoc}
                      onChange={e => {
                        const next = e.target.value as TipoDocumentoIdentidad;
                        setRegTipoDoc(next);
                        setRegDni('');
                      }}
                      className="px-2 py-2.5 bg-slate-100 border border-slate-300 rounded-xl font-bold text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">C.E.</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                    <input
                      type="text"
                      value={regDni}
                      onChange={e => {
                        if (regTipoDoc === 'DNI') {
                          setRegDni(e.target.value.replace(/\D/g, '').slice(0, 8));
                        } else {
                          setRegDni(e.target.value.toUpperCase().slice(0, 15));
                        }
                      }}
                      placeholder={regTipoDoc === 'DNI' ? '8 dígitos (Ej. 71428910)' : 'N° Documento (6-15 car.)'}
                      maxLength={regTipoDoc === 'DNI' ? 8 : 15}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={regTelefono}
                    onChange={e => setRegTelefono(e.target.value)}
                    placeholder="Ej. 966 555 210"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Nombres y Apellidos Completos *
                  </label>
                  <input
                    type="text"
                    value={regNombre}
                    onChange={e => setRegNombre(e.target.value)}
                    placeholder="Ej. Juan Carlos Huaytalla Quispe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo Permitido *
                    </label>
                    {regEmailTrimmed.includes('@') && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          regEmailIsPermitted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {regEmailIsPermitted ? '✓ Permitido' : '✕ No permitido'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="usuario@conectaoficios.pe o @gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> Ubicación en el Perú (Región · Provincia · Distrito) *
                  </label>
                  <PeruUbigeoSelector
                    mode="form"
                    showLabels
                    region={regRegion}
                    provincia={regProvincia}
                    distrito={regDistrito}
                    onChange={next => {
                      setRegRegion(next.region);
                      setRegProvincia(next.provincia);
                      setRegDistrito(next.distrito);
                    }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Dirección Exacta / Domicilio *
                  </label>
                  <input
                    type="text"
                    value={regDireccion}
                    onChange={e => setRegDireccion(e.target.value)}
                    placeholder="Ej. Av. Arequipa 1420 - Lince / Lima"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Especialidad / Oficio (Opcional)
                  </label>
                  <input
                    type="text"
                    value={regEspecialidad}
                    onChange={e => setRegEspecialidad(e.target.value)}
                    placeholder="Ej. Electricista SENATI / Hogar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Contraseña *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>
              </div>

              {/* Optional Emergency Family Contact & RUC */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div>
                  <span className="font-extrabold text-navy-950 block">
                    Contacto Familiar de Emergencia y RUC Tributario (Opcional al Registro)
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Para especialistas de multiservicios: registra un contacto familiar ante accidentes laborales y tu RUC activo (11 dígitos) si emites recibos o facturas.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="lg:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Contacto Familiar de Emergencia
                    </label>
                    <input
                      type="text"
                      value={regEmergNombre}
                      onChange={e => setRegEmergNombre(e.target.value)}
                      placeholder="Nombre completo del familiar"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Parentesco</label>
                    <select
                      value={regEmergParentesco}
                      onChange={e => setRegEmergParentesco(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    >
                      <option value="Familiar directo">Familiar directo</option>
                      <option value="Madre / Padre">Madre / Padre</option>
                      <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                      <option value="Hermano(a)">Hermano(a)</option>
                      <option value="Hijo(a)">Hijo(a)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teléfono Emergencia</label>
                    <input
                      type="tel"
                      value={regEmergTelefono}
                      onChange={e => setRegEmergTelefono(e.target.value.slice(0, 15))}
                      placeholder="Ej. 999 444 111"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      RUC de Contratista Independiente (11 dígitos)
                    </label>
                    <input
                      type="text"
                      value={regRuc}
                      onChange={e => setRegRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="Ej. 10418293041"
                      maxLength={11}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Registration Document & Media Uploads */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div>
                  <span className="font-extrabold text-navy-950 block">
                    Documentos y Multimedia de Identidad (Para Revisión del Administrador)
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Sube la copia de tu documento (DNI/CE/Pasaporte), foto personal, video de presentación y certificado técnico. Luego en <strong>Mi Perfil</strong> podrás completar los 5 bloques del Expediente (Recibo de Domicilio, Antecedentes Policiales/Penales/Judiciales, Licencia de Conducir, Contrato, Normas e Inventario).
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block">📷 Copia de {regTipoDoc} (Importante)</span>
                    <label className="block cursor-pointer px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-400 rounded-lg text-center font-semibold">
                      {regDniFoto ? '✓ Cambiar Foto DNI' : 'Subir Foto de DNI'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleImageUpload(
                            e.target.files?.[0],
                            url => setRegDniFoto(url),
                            msg => setRegMediaMsg(msg)
                          )
                        }
                      />
                    </label>
                    {regDniFoto && <img src={regDniFoto} alt="DNI" className="w-full h-16 object-cover rounded-lg" />}
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block">🤳 Foto de la Persona (Importante)</span>
                    <label className="block cursor-pointer px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 border border-dashed border-sky-400 rounded-lg text-center font-semibold text-sky-900">
                      {regFotoPersona ? '✓ Cambiar Foto Personal' : 'Subir Foto de Persona'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleImageUpload(
                            e.target.files?.[0],
                            url => setRegFotoPersona(url),
                            msg => setRegMediaMsg(msg)
                          )
                        }
                      />
                    </label>
                    {regFotoPersona && (
                      <img src={regFotoPersona} alt="Persona" className="w-full h-16 object-cover rounded-lg" />
                    )}
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block">🎥 Video de la Persona</span>
                    <label className="block cursor-pointer px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-400 rounded-lg text-center font-semibold text-emerald-900">
                      {regVideoPersona ? '✓ Cambiar Video' : 'Subir Video de Persona'}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={e =>
                          handleVideoUpload(
                            e.target.files?.[0],
                            (url, name, isSessionOnly) => {
                              setRegVideoPersona(url);
                              setRegVideoNombre(name);
                              setRegMediaMsg(
                                isSessionOnly ? `Video "${name}" cargado para esta sesión.` : null
                              );
                            },
                            msg => setRegMediaMsg(msg)
                          )
                        }
                      />
                    </label>
                    {regVideoPersona && (
                      <video src={regVideoPersona} controls className="w-full h-20 rounded-lg bg-black object-contain" />
                    )}
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block">📄 Certificado de lo que hace (Opcional)</span>
                    <label className="block cursor-pointer px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-dashed border-purple-300 rounded-lg text-center font-semibold text-purple-900">
                      {regCertUrl ? '✓ Cambiar Certificado' : 'Subir Certificado (Img/PDF)'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={e =>
                          handleCertUpload(
                            e.target.files?.[0],
                            (url, name, warning) => {
                              setRegCertUrl(url);
                              setRegCertNombre(name);
                              setRegMediaMsg(warning || null);
                            },
                            msg => setRegMediaMsg(msg)
                          )
                        }
                      />
                    </label>
                    {regCertNombre && (
                      <div className="text-[11px] text-purple-900 font-semibold truncate">📎 {regCertNombre}</div>
                    )}
                  </div>
                </div>

                {regMediaMsg && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                    {regMediaMsg}
                  </div>
                )}
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-99 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Completar Registro e Ingresar</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
