import React, { useState, useEffect } from 'react';
import { useConecta } from '../context/ConectaContext';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { TipoDocumentoIdentidad } from '../types';
import {
  X,
  UserPlus,
  LogIn,
  ShieldCheck,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Lock,
  AlertCircle,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    registrarUsuario,
    iniciarSesion,
    correosPermitidos,
    esCorreoPermitido
  } = useConecta();

  // Login states (Strictly Permitted Email + Password, clean inputs)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration states (all user parameters including Document & Permitted Email)
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
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    setLoginError(null);
    setLoginEmail('');
    setLoginPass('');
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const isRegister = showAuthModal === 'register';
  const loginEmailTrimmed = loginEmail.trim();
  const loginEmailIsPermitted = loginEmailTrimmed.includes('@') && esCorreoPermitido(loginEmailTrimmed);
  const regEmailTrimmed = regEmail.trim();
  const regEmailIsPermitted = regEmailTrimmed.includes('@') && esCorreoPermitido(regEmailTrimmed);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = iniciarSesion(loginEmail, loginPass);
    if (!res.ok) {
      setLoginError(res.error || 'Error al iniciar sesión.');
    } else {
      setShowAuthModal(null);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regTipoDoc === 'DNI') {
      if (regDni.replace(/\D/g, '').length !== 8) {
        setRegError('El DNI debe tener exactamente 8 dígitos.');
        return;
      }
    } else if (regDni.trim().length < 6) {
      setRegError('El Carnet de Extranjería o Pasaporte debe tener entre 6 y 15 caracteres.');
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
      especialidadPrincipal: regEspecialidad
    });

    if (!res.ok) {
      setRegError(res.error || 'No se pudo completar el registro.');
    } else {
      setShowAuthModal(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setShowAuthModal(null)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[94vh] overflow-y-auto border border-slate-200 relative text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Navy Header */}
        <div className="bg-navy-950 text-white p-6 rounded-t-3xl relative">
          <button
            onClick={() => setShowAuthModal(null)}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 mb-2 pr-8">
            <div className="w-20 h-20 rounded-full bg-white border-2 border-amber-400/80 overflow-hidden shadow-lg shrink-0 flex items-center justify-center p-0.5">
              <img
                src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
                alt="Trabaja Ya · Tu talento, nuestro compromiso"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TrabajaYa Perú · Correos Permitidos</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {isRegister ? 'Registro con Correo Permitido y DNI' : 'Inicio de Sesión Único'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isRegister
              ? 'Solo se admite el registro de cuentas con correo permitido y DNI. El Administrador del sistema es único.'
              : 'Ingresa con tu correo permitido y contraseña. El sistema reconoce automáticamente si tu cuenta tiene permiso de Usuario o de Administrador Único.'}
          </p>

          {/* Switch Mode Tabs */}
          <div className="mt-4 flex gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setShowAuthModal('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                !isRegister ? 'bg-amber-400 text-navy-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAuthModal('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                isRegister ? 'bg-amber-400 text-navy-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarme (Correo + DNI)</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {!isRegister ? (
            <>
              {/* Unified Single Sign-In Permitted Domains Notice */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-2">
                <p className="text-slate-700 leading-relaxed">
                  <strong>Acceso según correo permitido:</strong> Al validar tu correo aceptado y contraseña, ingresarás automáticamente a tu perfil de <strong>Usuario</strong> o de <strong>Administrador Único</strong>.
                </p>
                <div>
                  <span className="font-bold text-slate-800 block mb-1">
                    Correos / Dominios Aceptados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {correosPermitidos.map(regla => (
                      <span
                        key={regla}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px] font-semibold text-navy-900"
                      >
                        {regla}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 flex items-center gap-1">
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
                        {loginEmailIsPermitted ? '✓ Correo aceptado' : '✕ Correo no permitido'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="correo-permitido@dominio.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contraseña *</span>
                  </label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-white bg-navy-900 hover:bg-navy-950"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Validar Correo Permitido e Ingresar</span>
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950 text-[11px]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Administrador Único:</strong> Todo registro público asigna estrictamente el <strong>Permiso de Usuario</strong>. No es posible registrar administradores adicionales.
                  </span>
                </div>
                <div className="pl-6 flex flex-wrap items-center gap-1">
                  <span className="font-semibold text-emerald-800 mr-1">Correos permitidos:</span>
                  {correosPermitidos.map(regla => (
                    <span
                      key={regla}
                      className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono text-[10px] font-bold text-emerald-900"
                    >
                      {regla}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Documento (DNI / C.E. / Pas.) *
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={regTipoDoc}
                      onChange={e => {
                        setRegTipoDoc(e.target.value as TipoDocumentoIdentidad);
                        setRegDni('');
                      }}
                      className="px-2 py-2 bg-slate-100 border border-slate-300 rounded-xl font-bold text-navy-950"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">C.E.</option>
                      <option value="PASAPORTE">Pas.</option>
                    </select>
                    <input
                      type="text"
                      value={regDni}
                      onChange={e =>
                        regTipoDoc === 'DNI'
                          ? setRegDni(e.target.value.replace(/\D/g, '').slice(0, 8))
                          : setRegDni(e.target.value.toUpperCase().slice(0, 15))
                      }
                      placeholder={regTipoDoc === 'DNI' ? '8 dígitos' : 'N° Documento'}
                      maxLength={regTipoDoc === 'DNI' ? 8 : 15}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={regTelefono}
                    onChange={e => setRegTelefono(e.target.value)}
                    placeholder="Ej. 966 555 210"
                    maxLength={15}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Nombres y Apellidos Completos *
                  </label>
                  <input
                    type="text"
                    value={regNombre}
                    onChange={e => setRegNombre(e.target.value)}
                    placeholder="Ej. Juan Carlos Huaytalla Quispe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 flex items-center gap-1">
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> Ubicación en el Perú (Región · Provincia · Distrito) *
                  </label>
                  <PeruUbigeoSelector
                    mode="form"
                    showLabels
                    compact
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dirección Exacta / Domicilio *
                  </label>
                  <input
                    type="text"
                    value={regDireccion}
                    onChange={e => setRegDireccion(e.target.value)}
                    placeholder="Ej. Av. Arequipa 1420 - Lince / Lima"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Oficio / Especialidad (Opcional)
                  </label>
                  <input
                    type="text"
                    value={regEspecialidad}
                    onChange={e => setRegEspecialidad(e.target.value)}
                    placeholder="Ej. Electricista SENATI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Contraseña *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Completar Registro con Correo Permitido y DNI</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
