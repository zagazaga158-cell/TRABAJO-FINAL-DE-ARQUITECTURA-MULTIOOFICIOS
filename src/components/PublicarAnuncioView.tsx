import React, { useState, useEffect } from 'react';
import { useConecta } from '../context/ConectaContext';
import { PLAN_PRUEBA_GRATIS } from '../data/initialData';
import {
  CATEGORIAS_OFICIO,
  GRUPOS_OFICIO,
  MetodoPago,
  OficioType,
  PlanPublicacion,
  PlanPublicacionId,
  Servicio,
  CulqiPaymentReceipt
} from '../types';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { formatUbicacion, inferUbicacionPeru } from '../data/peruUbigeo';
import { CulqiCheckoutModal } from './CulqiCheckoutModal';
import {
  Megaphone,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  Award,
  MapPin,
  DollarSign,
  Lock,
  Sparkles,
  FileCheck,
  AlertCircle,
  QrCode,
  ArrowRight,
  Gift,
  ShieldCheck
} from 'lucide-react';

export const PublicarAnuncioView: React.FC = () => {
  const {
    currentUser,
    servicios,
    planesPublicacion,
    promoConfig,
    publicarAnuncioPagado,
    setActiveTab,
    setAdminTab
  } = useConecta();

  // Form parameters (pre-filled from registered user, editable for completeness)
  const initialUbi = inferUbicacionPeru(
    currentUser?.distrito,
    currentUser?.provincia,
    currentUser?.region
  );
  const [tecnicoDni, setTecnicoDni] = useState(currentUser?.dni || '');
  const [tecnicoNombre, setTecnicoNombre] = useState(currentUser?.nombreCompleto || '');
  const [tecnicoTelefono, setTecnicoTelefono] = useState(currentUser?.telefonoWhatsapp || '');
  const [region, setRegion] = useState<string>(initialUbi.region);
  const [provincia, setProvincia] = useState<string>(initialUbi.provincia);
  const [distrito, setDistrito] = useState<string>(initialUbi.distrito);
  const [oficio, setOficio] = useState<OficioType>('ELECTRICIDAD');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [institucion, setInstitucion] = useState('SENATI');
  const [codigoCertificado, setCodigoCertificado] = useState('');
  const [experienciaAnos, setExperienciaAnos] = useState<number>(5);
  const [turnosLibres, setTurnosLibres] = useState<number>(6);
  const [precioBase, setPrecioBase] = useState<number>(75);
  const [habilidadesTexto, setHabilidadesTexto] = useState('Diagnóstico Técnico, Herramientas Homologadas, Garantía de Trabajo');

  // Paid plan & Culqi checkout
  const [planId, setPlanId] = useState<PlanPublicacionId>('DESTACADO');
  const [metodoPago, setMetodoPago] = useState<'TARJETA' | 'YAPE_PLIN'>('TARJETA');
  const [showCulqiModal, setShowCulqiModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdPub, setCreatedPub] = useState<Servicio | null>(null);

  // Sync user defaults if user logs in / registers
  useEffect(() => {
    if (!currentUser) return;
    const ubi = inferUbicacionPeru(currentUser.distrito, currentUser.provincia, currentUser.region);
    setTecnicoDni(currentUser.dni);
    setTecnicoNombre(currentUser.nombreCompleto);
    setTecnicoTelefono(currentUser.telefonoWhatsapp);
    setRegion(ubi.region);
    setProvincia(ubi.provincia);
    setDistrito(ubi.distrito);
  }, [currentUser]);

  if (!currentUser) return null;

  // Ads submitted by the current user (or matching DNI)
  const misPublicaciones = servicios.filter(
    s => s.autorUsuarioId === currentUser.id || s.tecnicoDni === currentUser.dni
  );
  const puedeUsarPruebaGratis = promoConfig.pruebaGratisActiva && misPublicaciones.length === 0;

  const getPrecioEfectivoPlan = (p: PlanPublicacion): number => {
    if (p.id === 'PRUEBA_7') return 0;
    if (p.id === 'DESTACADO' && !promoConfig.descuentoDestacadoActivo && p.precioRegular) {
      return p.precioRegular;
    }
    return p.precio;
  };

  const planSeleccionado: PlanPublicacion =
    planId === 'PRUEBA_7' && puedeUsarPruebaGratis
      ? PLAN_PRUEBA_GRATIS
      : planesPublicacion.find(p => p.id === planId) || planesPublicacion[1] || planesPublicacion[0];

  const montoEfectivoSeleccionado = getPrecioEfectivoPlan(planSeleccionado);
  const tarifaClienteCalculada = Number((Number(precioBase || 0) * 1.10).toFixed(2));
  const garantiaCalculada = Number((Number(precioBase || 0) * 0.10).toFixed(2));

  const planBasicoRef = planesPublicacion.find(p => p.id === 'BASICO');
  const planDestacadoRef = planesPublicacion.find(p => p.id === 'DESTACADO');
  const costoAnualSiPagaMensual = planBasicoRef ? Number((planBasicoRef.precio * 12).toFixed(2)) : 58.80;
  const costoDosSemestresRegular = planDestacadoRef
    ? Number(((planDestacadoRef.precioRegular || planDestacadoRef.precio) * 2).toFixed(2))
    : 59.80;

  const finalizePublication = (receipt?: CulqiPaymentReceipt) => {
    const habilidadesArr = habilidadesTexto
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    const pub = publicarAnuncioPagado({
      oficio,
      titulo,
      descripcion,
      tecnicoNombre,
      tecnicoDni,
      tecnicoTelefono,
      institucionCertificadora: institucion,
      codigoCertificado: codigoCertificado || `DNI-${tecnicoDni}`,
      precioBase: Number(precioBase),
      turnosLibres: Number(turnosLibres),
      experienciaAnos: Number(experienciaAnos),
      region,
      provincia,
      distrito,
      habilidades: habilidadesArr,
      planId,
      metodoPago: (receipt?.method || metodoPago) as MetodoPago,
      culqiReceipt: receipt
    });

    setCreatedPub(pub);
    setTitulo('');
    setDescripcion('');
    setCodigoCertificado('');
    setIsPaying(false);
  };

  const handleSubmitAd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if ((currentUser.estadoCuenta || 'ACTIVO') !== 'ACTIVO') {
      setFormError('Tu cuenta aún está pendiente de aceptación por el Administrador. Completa tus datos en Mi Perfil y espera la aprobación.');
      return;
    }

    if (tecnicoDni.replace(/\D/g, '').length !== 8) {
      setFormError('El DNI del ofertante es obligatorio y debe tener 8 dígitos.');
      return;
    }
    if (tecnicoNombre.trim().length < 4) {
      setFormError('Ingresa el nombre completo del técnico o profesional.');
      return;
    }
    if (tecnicoTelefono.replace(/\D/g, '').length < 9) {
      setFormError('Ingresa un número celular válido (9 dígitos) para que los clientes puedan llamarte o escribirte por WhatsApp.');
      return;
    }
    if (titulo.trim().length < 8) {
      setFormError('El título del anuncio debe describir claramente el servicio ofrecido.');
      return;
    }
    if (descripcion.trim().length < 15) {
      setFormError('Describe detalladamente los trabajos incluidos en tu servicio.');
      return;
    }
    if (precioBase < 20) {
      setFormError('La tarifa base mínima es S/ 20.00.');
      return;
    }

    if (montoEfectivoSeleccionado <= 0) {
      setIsPaying(true);
      finalizePublication();
      return;
    }

    setShowCulqiModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {(currentUser.estadoCuenta || 'ACTIVO') !== 'ACTIVO' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm">Cuenta Pendiente de Aceptación por el Administrador</strong>
              <span>
                Para publicar anuncios de servicio, el Administrador debe aceptar primero tu cuenta registrada. Mientras tanto, puedes completar y editar todos tus datos en <strong>Mi Perfil</strong>.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold rounded-xl shrink-0"
          >
            Ir a Editar Mi Perfil
          </button>
        </div>
      )}

      {/* Banner Header */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0d3b66] via-[#082d52] to-[#001e3d] text-white p-6 sm:p-8 shadow-xl border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Publicación Pagada de Servicios · Permiso de Usuario</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ofrece tus Servicios Técnicos como Publicación
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Registra todos tus parámetros con tu <strong>DNI</strong>, elige tu plan de publicación y realiza el pago. El <strong>Administrador</strong> revisará y admitirá tu anuncio para que los clientes te contacten directamente por <strong>WhatsApp o Llamada</strong>.
            </p>
          </div>

          {/* Active User Credential Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 min-w-[260px] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold uppercase text-[10px] tracking-wider">
                Cuenta Conectada ({currentUser.permiso})
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">
                DNI {currentUser.dni}
              </span>
            </div>
            <div className="font-bold text-white text-sm">{currentUser.nombreCompleto}</div>
            <div className="text-slate-300 text-[11px]">
              📱 +51 {currentUser.telefonoWhatsapp} · 📍 {formatUbicacion(currentUser.distrito, currentUser.provincia, currentUser.region)}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('perfil')}
              className="w-full mt-1 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Editar Mis Datos en Perfil</span>
            </button>
          </div>
        </div>
      </section>

      {/* Success Banner after paying for a publication */}
      {createdPub && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-extrabold text-emerald-950">
                  ¡Pago de Publicación Registrado! ({createdPub.id})
                </h4>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-bold rounded-md text-[10px] uppercase">
                  Pendiente de Admisión por Administrador
                </span>
              </div>
              <p className="text-emerald-900">
                Anuncio: <strong>{createdPub.titulo}</strong> · DNI: <strong className="font-mono">{createdPub.tecnicoDni}</strong> · Pago: <strong>S/ {createdPub.pagoPublicacion?.montoPagado.toFixed(2)}</strong> ({createdPub.pagoPublicacion?.codigoAutorizacion}).
              </p>
              <p className="text-emerald-800 text-[11px]">
                Una vez que el Administrador admita tu publicación, aparecerá inmediatamente en el catálogo público con tus botones de WhatsApp y Llamada.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreatedPub(null)}
            className="px-3.5 py-2 bg-white border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-100 shrink-0"
          >
            Ocultar aviso
          </button>
        </div>
      )}

      {/* Main 2-Column Grid: Left (All Ad Parameters) + Right (Plan & Payment) */}
      <form onSubmit={handleSubmitAd} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Complete Parameters Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Datos de Identidad del Ofertante (con DNI) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>1. Parámetros de Identidad y Contacto Directo (DNI Obligatorio)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  DNI del Ofertante (8 dígitos) *
                </label>
                <input
                  type="text"
                  value={tecnicoDni}
                  onChange={e => setTecnicoDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  placeholder="Ej. 41829304"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Teléfono para WhatsApp y Llamadas *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-200 text-slate-600 border border-r-0 border-slate-300 rounded-l-xl font-mono">
                    +51
                  </span>
                  <input
                    type="tel"
                    value={tecnicoTelefono}
                    onChange={e => setTecnicoTelefono(e.target.value)}
                    placeholder="966 784 210"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-r-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo / Título Profesional a mostrar en el Anuncio *
                </label>
                <input
                  type="text"
                  value={tecnicoNombre}
                  onChange={e => setTecnicoNombre(e.target.value)}
                  placeholder="Ej. Téc. Wilber Mendoza Huayhua"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" /> Institución Certificadora / Respaldo *
                </label>
                <select
                  value={institucion}
                  onChange={e => setInstitucion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
                >
                  <option value="SENATI">SENATI</option>
                  <option value="SENCICO">SENCICO</option>
                  <option value="CAPECO">CAPECO</option>
                  <option value="CETPRO / Instituto Técnico">CETPRO / Instituto Técnico</option>
                  <option value="Técnico Independiente Verificado">Técnico Independiente Verificado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código de Certificado o Constancia
                </label>
                <input
                  type="text"
                  value={codigoCertificado}
                  onChange={e => setCodigoCertificado(e.target.value)}
                  placeholder="Ej. SENATI-EL-2023-1024"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Todos los Parámetros del Servicio Ofrecido */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Megaphone className="w-4 h-4 text-sky-600" />
              <span>2. Parámetros del Servicio Ofrecido (Publicación)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-2">
                <label className="block font-semibold text-slate-700">Categoría / Oficio *</label>
                <select
                  value={oficio}
                  onChange={e => setOficio(e.target.value as OficioType)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
                >
                  {GRUPOS_OFICIO.map(grupo => (
                    <optgroup key={grupo.id} label={`${grupo.icon} ${grupo.nombre}`}>
                      {CATEGORIAS_OFICIO.filter(cat => cat.grupoId === grupo.id).map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {(() => {
                  const catInfo = CATEGORIAS_OFICIO.find(c => c.id === oficio);
                  if (!catInfo) return null;
                  const habilidadesActuales = habilidadesTexto
                    .split(',')
                    .map(h => h.trim())
                    .filter(Boolean);
                  return (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-navy-950">Alcance de {catInfo.shortLabel}:</strong>{' '}
                        {catInfo.descripcionServicios}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-500 mr-1">
                          + Agregar especialidad:
                        </span>
                        {catInfo.tareasComunes.map(tarea => {
                          const yaIncluida = habilidadesActuales.some(
                            h => h.toLowerCase() === tarea.toLowerCase()
                          );
                          return (
                            <button
                              key={tarea}
                              type="button"
                              onClick={() => {
                                if (yaIncluida) return;
                                setHabilidadesTexto(prev =>
                                  prev.trim() ? `${prev.trim()}, ${tarea}` : tarea
                                );
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                yaIncluida
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300 hover:border-amber-400'
                              }`}
                            >
                              {yaIncluida ? `✓ ${tarea}` : `+ ${tarea}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> Zona de Cobertura en el Perú (Región · Provincia · Distrito) *
                </label>
                <PeruUbigeoSelector
                  mode="form"
                  showLabels
                  region={region}
                  provincia={provincia}
                  distrito={distrito}
                  onChange={next => {
                    setRegion(next.region);
                    setProvincia(next.provincia);
                    setDistrito(next.distrito);
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Título del Anuncio de Servicio *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ej. Instalación de Duchas Eléctricas, Llaves Térmicas y Tomacorrientes"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción Detallada del Ofrecimiento *
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Explica qué incluye tu visita técnica, materiales de prueba, horarios y garantía de tu trabajo..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tarifa Base que Cobras (S/) *
                </label>
                <input
                  type="number"
                  min={20}
                  step={5}
                  value={precioBase}
                  onChange={e => setPrecioBase(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Precio visible al cliente (+10% garantía S/ {garantiaCalculada.toFixed(2)}): <strong className="text-navy-950">S/ {tarifaClienteCalculada.toFixed(2)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Años Exp. *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experienciaAnos}
                    onChange={e => setExperienciaAnos(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turnos / Sem. *</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={turnosLibres}
                    onChange={e => setTurnosLibres(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Habilidades y Especialidades (separadas por coma)
                </label>
                <input
                  type="text"
                  value={habilidadesTexto}
                  onChange={e => setHabilidadesTexto(e.target.value)}
                  placeholder="Ej. Cableado Estructurado, Pozo a Tierra, Megóhmetro"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Select Plan & Pay to Publish */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md sticky top-28 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-950 flex items-center justify-between">
                <span>3. Pago por Publicación de Anuncio</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded uppercase">
                  Moderación Admin
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selecciona tu plan para publicar tu anuncio. Solo el Administrador puede modificar tarifas y duraciones.
              </p>
              {currentUser.permiso === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('planes');
                    setActiveTab('portal');
                  }}
                  className="mt-2 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Editar Planes y Precios (Solo Admin)</span>
                </button>
              )}
            </div>

            {/* 1. Primera Publicación Promocional (7 días gratis) */}
            {puedeUsarPruebaGratis ? (
              <div
                onClick={() => setPlanId('PRUEBA_7')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  planSeleccionado.id === 'PRUEBA_7'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        planSeleccionado.id === 'PRUEBA_7'
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-emerald-400'
                      }`}
                    >
                      {planSeleccionado.id === 'PRUEBA_7' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase flex items-center gap-1">
                        <Gift className="w-3 h-3" /> {PLAN_PRUEBA_GRATIS.categoriaEtiqueta}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {PLAN_PRUEBA_GRATIS.nombre} · 7 días gratis
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-700 shrink-0">GRATIS</span>
                </div>
                <p className="text-[11px] text-emerald-900/90 mt-1.5 pl-6">
                  Prueba la plataforma sin costo en tu 1ra publicación (funciones básicas por 7 días).
                </p>
              </div>
            ) : (
              promoConfig.pruebaGratisActiva && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Ya utilizaste tu primera publicación promocional gratuita de 7 días.</span>
                </div>
              )
            )}

            {/* Plan Cards */}
            <div className="space-y-3">
              {planesPublicacion.map(plan => {
                const selected = planSeleccionado.id === plan.id;
                const precioMostrar = getPrecioEfectivoPlan(plan);
                const tieneDescuento =
                  plan.id === 'DESTACADO' &&
                  promoConfig.descuentoDestacadoActivo &&
                  plan.precioRegular &&
                  plan.precioRegular > precioMostrar;
                const ahorroVsSemestral =
                  plan.id === 'PRO'
                    ? Number((costoDosSemestresRegular - precioMostrar).toFixed(2))
                    : 0;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setPlanId(plan.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selected
                        ? 'border-navy-900 bg-slate-50 shadow-xs'
                        : plan.id === 'PRO'
                        ? 'border-amber-300/70 hover:border-amber-400 bg-amber-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                            selected ? 'border-navy-900 bg-navy-900' : 'border-slate-300'
                          }`}
                        >
                          {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                              {plan.categoriaEtiqueta}
                            </span>
                            {plan.id === 'DESTACADO' && (
                              <span className="text-[10px] bg-amber-300 text-navy-950 font-extrabold px-1.5 py-0.5 rounded">
                                {plan.subtituloTag}
                              </span>
                            )}
                            {plan.id === 'PRO' && (
                              <span className="text-[10px] bg-navy-900 text-amber-300 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> {plan.subtituloTag}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                            {plan.nombre}{' '}
                            <span className="font-semibold text-slate-500">
                              · {plan.duracionDias} días de publicación
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {tieneDescuento && plan.precioRegular && (
                          <span className="text-[11px] text-slate-400 line-through block tabular-nums">
                            S/ {plan.precioRegular.toFixed(2)}
                          </span>
                        )}
                        <span className="text-sm font-black text-navy-950 tabular-nums">
                          S/ {precioMostrar.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {tieneDescuento && plan.precioRegular && (
                      <div className="mt-1.5 pl-6">
                        <span className="inline-block text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          🔥 Descuento de Lanzamiento: ahorras S/ {(plan.precioRegular - precioMostrar).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Visible Annual Savings Comparison for Especialista PRO */}
                    {plan.id === 'PRO' && (
                      <div className="mt-2 ml-6 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-950 space-y-0.5">
                        <div className="font-extrabold flex items-center justify-between">
                          <span>Equivale a S/ {(precioMostrar / 12).toFixed(2)}/mes (365 días)</span>
                          {ahorroVsSemestral > 0 && (
                            <span className="text-emerald-700">
                              Ahorras S/ {ahorroVsSemestral.toFixed(2)} vs semestral
                            </span>
                          )}
                        </div>
                        <p className="text-amber-900/90">
                          Frente a pagar 2 semestres regulares (S/ {costoDosSemestresRegular.toFixed(2)}) o 12 meses Básico (S/ {costoAnualSiPagaMensual.toFixed(2)}), incluye Perfil PRO, Sello de Documentos Verificados y Posicionamiento Prioritario.
                        </p>
                      </div>
                    )}

                    <ul className="mt-2 pl-6 space-y-1 text-[11px] text-slate-600">
                      {plan.beneficios.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.id === 'BASICO' && (
                      <div className="mt-1.5 pl-6 text-[10px] font-semibold text-slate-500">
                        {plan.subtituloTag}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Culqi Payment Method (skipped when 7-day free promo is selected) */}
            {montoEfectivoSeleccionado > 0 ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Pasarela de Pago Culqi Perú
                  </label>
                  <span className="px-2 py-0.5 bg-[#00a19b] text-white text-[10px] font-black rounded uppercase">
                    Culqi
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('TARJETA')}
                    className={`p-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      metodoPago === 'TARJETA'
                        ? 'bg-[#061a33] text-white border-[#00a19b] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#00a19b]" />
                    <span>Tarjeta Culqi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('YAPE_PLIN')}
                    className={`p-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      metodoPago === 'YAPE_PLIN'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Yape Culqi</span>
                  </button>
                </div>

                {metodoPago === 'TARJETA' ? (
                  <div className="p-3 bg-teal-50/70 border border-[#00a19b]/40 rounded-xl text-[11px] text-[#061a33] flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#007a78] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Checkout Seguro Culqi (Visa · Mastercard · Amex · Diners)</strong>
                      <span className="text-slate-600">
                        Al presionar pagar se abrirá la pasarela Culqi para tokenizar y procesar S/ {montoEfectivoSeleccionado.toFixed(2)} de forma segura.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-center space-y-1.5">
                    <div className="w-10 h-10 mx-auto bg-purple-600 text-white rounded-xl flex items-center justify-center">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <p className="text-[11px] text-purple-900 font-semibold">
                      Pago de Anuncio con Yape vía Culqi: S/ {montoEfectivoSeleccionado.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Sin costo de tarjeta ni Yape: activa tu <strong>primera publicación promocional</strong> de 7 días gratis.
                </span>
              </div>
            )}

            {/* Summary Total */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {planSeleccionado.nombre}
                </span>
                <span className="text-[11px] text-slate-500">
                  {planSeleccionado.duracionDias} días de publicación · Sujeto a admisión Admin
                </span>
              </div>
              <span className="text-2xl font-black text-navy-950 tabular-nums">
                {montoEfectivoSeleccionado === 0 ? 'S/ 0.00' : `S/ ${montoEfectivoSeleccionado.toFixed(2)}`}
              </span>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPaying}
              className="w-full py-3.5 px-4 bg-[#00a19b] hover:bg-[#008c87] text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPaying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando Publicación...</span>
                </>
              ) : montoEfectivoSeleccionado === 0 ? (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Activar 7 Días Gratis y Enviar Anuncio</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Pagar S/ {montoEfectivoSeleccionado.toFixed(2)} con Culqi y Enviar Anuncio</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>El Administrador revisará tu DNI y parámetros para admitir la publicación.</span>
            </div>
          </div>
        </div>
      </form>

      {/* SECTION: Mis Publicaciones Enviadas */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-navy-950">
              Mis Publicaciones de Servicio ({misPublicaciones.length})
            </h3>
            <p className="text-xs text-slate-500">
              Estado en tiempo real de los anuncios enviados con tu DNI ({currentUser.dni}).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('catalogo')}
            className="text-xs font-bold text-navy-900 hover:text-amber-600 flex items-center gap-1"
          >
            <span>Ver Catálogo Público</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {misPublicaciones.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Aún no has publicado anuncios de servicios con tu cuenta. Completa el formulario superior para aparecer en TrabajaYa.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misPublicaciones.map(pub => (
              <div key={pub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                      {pub.oficioLabel}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{pub.titulo}</h4>
                  </div>

                  {pub.estadoPublicacion === 'APROBADO' && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Admitido en Catálogo
                    </span>
                  )}
                  {pub.estadoPublicacion === 'PENDIENTE_APROBACION' && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" /> Esperando Admin
                    </span>
                  )}
                  {pub.estadoPublicacion === 'RECHAZADO' && (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" /> Rechazado
                    </span>
                  )}
                </div>

                <div className="text-slate-600 space-y-0.5">
                  <div>DNI: <strong className="font-mono">{pub.tecnicoDni}</strong> · Teléfono: <strong className="font-mono">+51 {pub.tecnicoTelefono}</strong></div>
                  <div>Ubicación: {formatUbicacion(pub.distrito, pub.provincia, pub.region)} · Tarifa al cliente: <strong>S/ {pub.tarifaCliente.toFixed(2)}</strong></div>
                </div>

                {pub.pagoPublicacion && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-600">
                      {pub.pagoPublicacion.planNombre}
                      {pub.pagoPublicacion.pasarela === 'CULQI' && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-[#00a19b]/15 text-[#006965] font-extrabold rounded text-[10px]">
                          Culqi
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      Pagado S/ {pub.pagoPublicacion.montoPagado.toFixed(2)} · {pub.pagoPublicacion.codigoAutorizacion}
                    </span>
                  </div>
                )}

                {pub.motivoRechazo && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px]">
                    <strong>Observación del Administrador:</strong> {pub.motivoRechazo}
                  </div>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('perfil')}
                    className="text-[11px] font-bold text-navy-900 hover:text-amber-600 underline"
                  >
                    Editar publicación en Mi Perfil →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Culqi Payment Modal for Ad Plans */}
      <CulqiCheckoutModal
        isOpen={showCulqiModal}
        onClose={() => setShowCulqiModal(false)}
        onSuccess={receipt => {
          setShowCulqiModal(false);
          finalizePublication(receipt);
        }}
        amountSoles={montoEfectivoSeleccionado}
        title={`Publicar Anuncio · ${planSeleccionado.nombre}`}
        description={titulo.trim() || `${planSeleccionado.nombre} (${planSeleccionado.duracionDias} días)`}
        concepto="ANUNCIO"
        defaultEmail={currentUser.email}
        defaultPhone={tecnicoTelefono}
        customerName={tecnicoNombre}
        initialMethod={metodoPago}
      />
    </div>
  );
};
