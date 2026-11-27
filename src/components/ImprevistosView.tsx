import React, { useState, useEffect } from 'react';
import { useConecta, PRECIO_PUBLICACION_IMPREVISTO } from '../context/ConectaContext';
import {
  CATEGORIAS_OFICIO,
  GRUPOS_OFICIO,
  GrupoOficioId,
  ImprevistoHogar,
  MetodoPago,
  OficioType,
  UrgenciaImprevisto,
  CulqiPaymentReceipt
} from '../types';
import { compressImageToDataUrl } from '../utils/mediaUpload';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { formatUbicacion, inferUbicacionPeru } from '../data/peruUbigeo';
import { CulqiCheckoutModal } from './CulqiCheckoutModal';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Home,
  LogIn,
  MapPin,
  MessageSquare,
  PhoneCall,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Wrench,
  X,
  ArrowUpDown,
  DollarSign,
  User
} from 'lucide-react';

export const ImprevistosView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    imprevistos,
    setActiveTab,
    setShowAuthModal,
    verPerfilPublico,
    publicarImprevisto,
    ofrecerServicioImprevisto,
    aceptarOfertaImprevisto,
    actualizarMiPerfil,
    openCallModal,
    abrirChatDirecto,
    showToast
  } = useConecta();

  // Publish form toggle & state
  const initialUbi = inferUbicacionPeru(
    currentUser?.distrito,
    currentUser?.provincia,
    currentUser?.region
  );
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [oficio, setOficio] = useState<OficioType>('ELECTRICIDAD');
  const [urgencia, setUrgencia] = useState<UrgenciaImprevisto>('URGENTE');
  const [region, setRegion] = useState<string>(initialUbi.region);
  const [provincia, setProvincia] = useState<string>(initialUbi.provincia);
  const [distrito, setDistrito] = useState<string>(initialUbi.distrito);
  const [direccion, setDireccion] = useState(currentUser?.direccion || '');
  const [telefono, setTelefono] = useState(currentUser?.telefonoWhatsapp || '');
  const [presupuesto, setPresupuesto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [metodoPagoImprevisto, setMetodoPagoImprevisto] = useState<'TARJETA' | 'YAPE_PLIN'>('YAPE_PLIN');
  const [showCulqiModal, setShowCulqiModal] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Filters & sorting
  const [filtroGrupo, setFiltroGrupo] = useState<'TODOS' | GrupoOficioId>('TODOS');
  const [filtroOficio, setFiltroOficio] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ABIERTO' | 'ADJUDICADO'>('TODOS');
  const [filtroRegion, setFiltroRegion] = useState<string>('TODOS');
  const [filtroProvincia, setFiltroProvincia] = useState<string>('TODOS');
  const [filtroDistrito, setFiltroDistrito] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [ordenOfertas, setOrdenOfertas] = useState<'ESTRELLAS' | 'PRECIO'>('ESTRELLAS');

  // Inline technician offer form state
  const [cotizandoId, setCotizandoId] = useState<string | null>(null);
  const [montoOferta, setMontoOferta] = useState<string>('65');
  const [tiempoEstimado, setTiempoEstimado] = useState('Hoy en menos de 2 horas');
  const [garantiaDias, setGarantiaDias] = useState<number>(30);
  const [especialidadOferta, setEspecialidadOferta] = useState(
    currentUser?.especialidadPrincipal || ''
  );
  const [mensajePropuesta, setMensajePropuesta] = useState('');
  const [ofertaError, setOfertaError] = useState<string | null>(null);

  // Image lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const ubi = inferUbicacionPeru(currentUser.distrito, currentUser.provincia, currentUser.region);
    setRegion(ubi.region);
    setProvincia(ubi.provincia);
    setDistrito(ubi.distrito);
    if (!direccion.trim() && currentUser.direccion) setDireccion(currentUser.direccion);
    if (!telefono.trim() && currentUser.telefonoWhatsapp) setTelefono(currentUser.telefonoWhatsapp);
  }, [currentUser]);

  const puedePublicarImprevisto = true;

  const puedeOfrecerServicio =
    !currentUser ||
    currentUser.permiso === 'ADMIN' ||
    (currentUser.tipoUsuario || 'AMBOS') === 'OFERTANTE_OFICIO' ||
    (currentUser.tipoUsuario || 'AMBOS') === 'AMBOS';

  const habilitarAmbosRoles = () => {
    if (!currentUser) return;
    actualizarMiPerfil({
      dni: currentUser.dni,
      nombreCompleto: currentUser.nombreCompleto,
      telefonoWhatsapp: currentUser.telefonoWhatsapp,
      region: currentUser.region,
      provincia: currentUser.provincia,
      distrito: currentUser.distrito,
      direccion: currentUser.direccion,
      especialidadPrincipal: currentUser.especialidadPrincipal,
      tipoUsuario: 'AMBOS'
    });
  };

  const handleIncidentPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPublishError(null);
    const remainingSlots = Math.max(0, 4 - imagenes.length);
    const selected = Array.from(files).slice(0, remainingSlots);
    try {
      const compressed = await Promise.all(
        selected.map(file => compressImageToDataUrl(file, 850, 0.72))
      );
      setImagenes(prev => [...prev, ...compressed].slice(0, 4));
    } catch (err: any) {
      setPublishError(err?.message || 'No se pudieron procesar las imágenes.');
    }
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    if (!currentUser) {
      const msg = 'Debes iniciar sesión o registrarte para pagar S/ 5.00 con Culqi y publicar tu imprevisto.';
      setPublishError(msg);
      showToast('Inicia Sesión o Regístrate', msg, 'warning');
      return;
    }
    if (titulo.trim().length < 3) {
      const msg = 'Ingresa un título breve para el imprevisto (mín. 3 caracteres).';
      setPublishError(msg);
      showToast('Falta el título', msg, 'warning');
      return;
    }
    if (descripcion.trim().length < 5) {
      const msg = 'Describe brevemente lo que ocurrió en tu casa para que los técnicos puedan cotizar.';
      setPublishError(msg);
      showToast('Falta la descripción', msg, 'warning');
      return;
    }

    setShowCulqiModal(true);
  };

  const handleCulqiPaymentSuccess = (receipt: CulqiPaymentReceipt) => {
    setShowCulqiModal(false);
    const res = publicarImprevisto({
      oficio,
      titulo,
      descripcion,
      region,
      provincia,
      distrito,
      direccion: direccion || currentUser?.direccion || 'Por coordinar',
      urgencia,
      presupuestoReferencial: presupuesto ? Number(presupuesto) : undefined,
      telefonoContacto: telefono || currentUser?.telefonoWhatsapp || '999999999',
      imagenes,
      metodoPago: receipt.method as MetodoPago,
      culqiReceipt: receipt
    });

    if (!res.ok) {
      const msg = res.error || 'No se pudo publicar el imprevisto.';
      setPublishError(msg);
      showToast('No se pudo publicar', msg, 'warning');
      return;
    }

    setTitulo('');
    setDescripcion('');
    setPresupuesto('');
    setImagenes([]);
    setFiltroGrupo('TODOS');
    setFiltroOficio('TODOS');
    setFiltroEstado('TODOS');
    setFiltroRegion('TODOS');
    setFiltroProvincia('TODOS');
    setFiltroDistrito('TODOS');
    setBusqueda('');
    setShowPublishForm(false);
  };

  const handleOpenOfferForm = (imp: ImprevistoHogar) => {
    if (!currentUser) {
      setActiveTab('acceso');
      return;
    }
    setCotizandoId(cotizandoId === imp.id ? null : imp.id);
    setOfertaError(null);
    setMontoOferta(imp.presupuestoReferencial ? String(imp.presupuestoReferencial) : '65');
    setEspecialidadOferta(currentUser.especialidadPrincipal || imp.oficioLabel);
    setMensajePropuesta('');
  };

  const handleSubmitOffer = (e: React.FormEvent, impId: string) => {
    e.preventDefault();
    setOfertaError(null);
    const res = ofrecerServicioImprevisto(impId, {
      montoOferta: Number(montoOferta),
      tiempoEstimado,
      garantiaDias: Number(garantiaDias),
      mensajePropuesta,
      especialidad: especialidadOferta
    });
    if (!res.ok) {
      setOfertaError(res.error || 'No se pudo enviar tu cotización.');
      return;
    }
    setCotizandoId(null);
    setMensajePropuesta('');
  };

  const categoriasFiltradasPorGrupo =
    filtroGrupo === 'TODOS'
      ? CATEGORIAS_OFICIO
      : CATEGORIAS_OFICIO.filter(c => c.grupoId === filtroGrupo);

  const filtrados = imprevistos
    .filter(imp => imp.estado !== 'RETIRADO_ADMIN')
    .filter(imp => {
      if (filtroGrupo !== 'TODOS') {
        const cat = CATEGORIAS_OFICIO.find(c => c.id === imp.oficio);
        if (!cat || cat.grupoId !== filtroGrupo) return false;
      }
      if (filtroOficio !== 'TODOS' && imp.oficio !== filtroOficio) return false;
      if (filtroEstado !== 'TODOS' && imp.estado !== filtroEstado) return false;
      const ubi = inferUbicacionPeru(imp.distrito, imp.provincia, imp.region);
      if (filtroRegion !== 'TODOS' && ubi.region.toLowerCase() !== filtroRegion.toLowerCase()) return false;
      if (filtroProvincia !== 'TODOS' && ubi.provincia.toLowerCase() !== filtroProvincia.toLowerCase()) return false;
      if (filtroDistrito !== 'TODOS' && ubi.distrito.toLowerCase() !== filtroDistrito.toLowerCase()) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        return (
          imp.titulo.toLowerCase().includes(q) ||
          imp.descripcion.toLowerCase().includes(q) ||
          ubi.region.toLowerCase().includes(q) ||
          ubi.provincia.toLowerCase().includes(q) ||
          ubi.distrito.toLowerCase().includes(q) ||
          imp.autorNombre.toLowerCase().includes(q)
        );
      }
      return true;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-navy-950 via-[#0d3b66] to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Imprevistos en Casa · Cotizaciones con Estrellas y Costo Real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Publica un Imprevisto en tu Hogar y Compara Técnicos
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Sube <strong>imágenes de lo ocurrido en tu casa</strong> (cortocircuitos, fugas, chapas, reparaciones). Las personas de oficio envían su <strong>monto de reparación (S/)</strong> y tú comparas sus <strong>⭐ estrellas</strong> y precios antes de elegir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPublishForm(prev => !prev)}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              {showPublishForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>
                {showPublishForm
                  ? 'Cerrar Formulario'
                  : `Publicar Imprevisto (S/ ${PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)})`}
              </span>
            </button>

            {!currentUser && (
              <button
                type="button"
                onClick={() => setActiveTab('acceso')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Publish New Home Incident Form */}
      {showPublishForm && puedePublicarImprevisto && (
        <form
          onSubmit={handlePublishSubmit}
          className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-lg space-y-5 text-xs"
        >
          {!currentUser && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
              <div>
                <p className="font-extrabold text-xs">Inicia sesión o regístrate para publicar</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Para pagar S/ {PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)} y publicar tu imprevisto con tu nombre y teléfono, inicia sesión o crea tu cuenta gratis.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal('register');
                    setActiveTab('acceso');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Registrarme
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal('login');
                    setActiveTab('acceso');
                  }}
                  className="px-3.5 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-navy-950 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" />
                <span>Publicar Suceso o Imprevisto Ocurrido en Casa</span>
              </h2>
              <p className="text-slate-500 mt-0.5">
                Puedes adjuntar fotos reales del daño (opcional) para que las personas de oficio evalúen y te envíen su costo exacto de reparación.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPublishForm(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Título del Imprevisto *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej. Se quemó la llave térmica de la ducha / Fuga en lavadero"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría de Oficio *</label>
              <select
                value={oficio}
                onChange={e => setOficio(e.target.value as OficioType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
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
              <span className="text-[10px] text-slate-500 mt-1 block leading-snug">
                {CATEGORIAS_OFICIO.find(c => c.id === oficio)?.descripcionServicios}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nivel de Urgencia *</label>
              <select
                value={urgencia}
                onChange={e => setUrgencia(e.target.value as UrgenciaImprevisto)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
              >
                <option value="NORMAL">🟢 Normal (Programable)</option>
                <option value="URGENTE">🟠 Urgente (Hoy mismo)</option>
                <option value="EMERGENCIA">🔴 Emergencia (Inmediata)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Ubicación Exacta en el Perú (Región · Provincia · Distrito) *</span>
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Presupuesto Referencial S/ (Opcional)
              </label>
              <input
                type="number"
                min={1}
                value={presupuesto}
                onChange={e => setPresupuesto(e.target.value)}
                placeholder="Ej. 80"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Dirección del Domicilio *</label>
              <input
                type="text"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                placeholder="Ej. Jr. 28 de Julio 450"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp / Celular *</label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="966 123 456"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">
                Descripción Detallada del Imprevisto *
              </label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Explica qué ocurrió en tu casa, desde cuándo pasa y qué necesitas que reparen..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                required
              />
            </div>

            {/* Multiple Images Upload (Optional) */}
            <div className="sm:col-span-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-navy-950 block">
                    Imágenes del Suceso / Imprevisto (Opcional · Máx. 4 fotos)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Las fotos ayudan a los técnicos a darte un presupuesto más exacto antes de ir.
                  </span>
                </div>

                {imagenes.length < 4 && (
                  <label className="cursor-pointer px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl inline-flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>+ Subir Imágenes ({imagenes.length}/4)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        void handleIncidentPhotos(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>

              {imagenes.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imagenes.map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-300 bg-white">
                      <img src={imgUrl} alt={`Evidencia ${idx + 1}`} className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagenes(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full shadow"
                        title="Quitar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tarifa obligatoria de publicación vía Pasarela Culqi: S/ 5.00 */}
          <div className="p-4 sm:p-5 bg-teal-50/60 border-2 border-[#00a19b]/50 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#00a19b] text-white text-[10px] font-black rounded uppercase">
                    Culqi
                  </span>
                  <span>
                    Pago con Pasarela Culqi Perú: S/ {PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)}
                  </span>
                </h3>
                <p className="text-slate-700 text-[11px] mt-0.5">
                  El cobro de <strong>S/ {PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)} soles</strong> se procesa de forma segura mediante <strong>Culqi Checkout</strong> con Yape o Tarjeta.
                </p>
              </div>
              <span className="px-3 py-1 bg-[#061a33] text-teal-300 font-black text-sm rounded-xl shrink-0">
                S/ {PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMetodoPagoImprevisto('YAPE_PLIN')}
                className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  metodoPagoImprevisto === 'YAPE_PLIN'
                    ? 'bg-white border-purple-600 ring-2 ring-purple-200'
                    : 'bg-white/70 border-slate-300 hover:border-slate-400'
                }`}
              >
                <div>
                  <span className="font-extrabold text-navy-950 block">📱 Yape vía Culqi</span>
                  <span className="text-[11px] text-slate-500">Aprobación instantánea</span>
                </div>
                <span className="font-mono font-black text-purple-700">S/ 5.00</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPagoImprevisto('TARJETA')}
                className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  metodoPagoImprevisto === 'TARJETA'
                    ? 'bg-white border-[#00a19b] ring-2 ring-[#00a19b]/20'
                    : 'bg-white/70 border-slate-300 hover:border-slate-400'
                }`}
              >
                <div>
                  <span className="font-extrabold text-navy-950 block">💳 Tarjeta vía Culqi</span>
                  <span className="text-[11px] text-slate-500">Visa · Mastercard · Amex · Diners</span>
                </div>
                <span className="font-mono font-black text-[#007a78]">S/ 5.00</span>
              </button>
            </div>
          </div>

          {publishError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
              {publishError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPublishForm(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00a19b] hover:bg-[#008c87] text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Pagar S/ {PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)} con Culqi y Publicar
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* 4 Service Groups Filter Row */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setFiltroGrupo('TODOS');
              setFiltroOficio('TODOS');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              filtroGrupo === 'TODOS'
                ? 'bg-amber-400 text-navy-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos los Grupos (4)
          </button>
          {GRUPOS_OFICIO.map(grupo => (
            <button
              key={grupo.id}
              type="button"
              onClick={() => {
                setFiltroGrupo(grupo.id);
                setFiltroOficio('TODOS');
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                filtroGrupo === grupo.id
                  ? 'bg-amber-400 text-navy-950 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {grupo.icon} {grupo.nombre}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'TODOS', label: '🛠️ Todas las especialidades' },
              ...categoriasFiltradasPorGrupo.map(c => ({ id: c.id, label: `${c.icon} ${c.shortLabel}` }))
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFiltroOficio(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filtroOficio === cat.id
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar imprevisto o ciudad..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-xl"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ABIERTO">Abiertos (Recibiendo ofertas)</option>
              <option value="ADJUDICADO">Técnico Elegido</option>
            </select>

            <button
              type="button"
              onClick={() => setOrdenOfertas(prev => (prev === 'ESTRELLAS' ? 'PRECIO' : 'ESTRELLAS'))}
              className="px-3 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl flex items-center gap-1.5"
              title="Cambiar orden de ofertas de técnicos"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                Ordenar ofertas: {ordenOfertas === 'ESTRELLAS' ? '⭐ Mejores Estrellas' : '💰 Menor Monto'}
              </span>
            </button>
          </div>
        </div>

        {/* Cascading Región / Provincia / Distrito Filter */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Filtrar por Región, Provincia y Distrito del Perú:
            </span>
            {filtroRegion !== 'TODOS' && (
              <button
                type="button"
                onClick={() => {
                  setFiltroRegion('TODOS');
                  setFiltroProvincia('TODOS');
                  setFiltroDistrito('TODOS');
                }}
                className="text-[11px] font-bold text-rose-700 hover:underline"
              >
                Ver todo el Perú
              </button>
            )}
          </div>
          <PeruUbigeoSelector
            mode="filter"
            compact
            showLabels={false}
            region={filtroRegion}
            provincia={filtroProvincia}
            distrito={filtroDistrito}
            onChange={next => {
              setFiltroRegion(next.region);
              setFiltroProvincia(next.provincia);
              setFiltroDistrito(next.distrito);
            }}
          />
        </div>
      </section>

      {/* Incidents List */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-2">
          <Home className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay imprevistos con esos filtros</h3>
          <p className="text-xs text-slate-500">
            Prueba cambiando los filtros o publica un nuevo imprevisto en tu hogar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtrados.map(imp => {
            const isAuthor = currentUser?.id === imp.autorUsuarioId;
            const isAdmin = currentUser?.permiso === 'ADMIN';
            const canSelectOffer = (isAuthor || isAdmin) && imp.estado === 'ABIERTO';
            const canOfferQuote =
              imp.estado === 'ABIERTO' &&
              puedeOfrecerServicio &&
              (!currentUser || currentUser.id !== imp.autorUsuarioId || isAdmin);

            const sortedOffers = [...imp.ofertas].sort((a, b) => {
              if (a.estado === 'ACEPTADA' && b.estado !== 'ACEPTADA') return -1;
              if (b.estado === 'ACEPTADA' && a.estado !== 'ACEPTADA') return 1;
              if (ordenOfertas === 'ESTRELLAS') {
                return b.calificacionEstrellas - a.calificacionEstrellas || a.montoOferta - b.montoOferta;
              }
              return a.montoOferta - b.montoOferta || b.calificacionEstrellas - a.calificacionEstrellas;
            });

            return (
              <article
                key={imp.id}
                className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${
                  imp.estado === 'ADJUDICADO'
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : imp.urgencia === 'EMERGENCIA'
                    ? 'border-rose-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Top Header of Incident */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-500">{imp.id}</span>
                        <span className="px-2.5 py-0.5 bg-navy-900 text-amber-300 font-bold rounded-md text-[11px] uppercase">
                          {imp.oficioLabel}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-extrabold text-[11px] uppercase flex items-center gap-1 ${
                            imp.urgencia === 'EMERGENCIA'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : imp.urgencia === 'URGENTE'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {imp.urgencia}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] uppercase ${
                            imp.estado === 'ABIERTO'
                              ? 'bg-sky-100 text-sky-900'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {imp.estado === 'ABIERTO' ? '● Recibiendo Propuestas' : '✓ Técnico Elegido'}
                        </span>
                        {imp.pagoPublicacion && (
                          <span className="px-2.5 py-0.5 rounded-md font-bold text-[11px] bg-teal-50 text-[#006965] border border-[#00a19b]/40">
                            ✓ Pagado con Culqi S/ {imp.pagoPublicacion.montoPagado.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-navy-950">{imp.titulo}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{imp.descripcion}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        {currentRole === 'ADMIN' ? (
                          <button
                            type="button"
                            onClick={() =>
                              verPerfilPublico({
                                userId: imp.autorUsuarioId,
                                dni: imp.autorDni,
                                nombre: imp.autorNombre
                              })
                            }
                            className="inline-flex items-center gap-1.5 font-bold text-navy-950 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Home className="w-3.5 h-3.5 text-amber-600" />
                            <span>{imp.autorNombre}</span>
                            <span className="text-[10px] text-sky-700 underline ml-0.5">Ver Perfil</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-bold text-navy-950 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                            <Home className="w-3.5 h-3.5 text-amber-600" />
                            <span>{imp.autorNombre}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {formatUbicacion(imp.distrito, imp.provincia, imp.region)} ({imp.direccion})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {imp.fechaPublicacion}
                        </span>
                        {imp.presupuestoReferencial && (
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-navy-950">
                            Ref. Cliente: S/ {imp.presupuestoReferencial.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action CTA for Tradespeople */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {canOfferQuote && (
                        <button
                          type="button"
                          onClick={() => handleOpenOfferForm(imp)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <Wrench className="w-4 h-4" />
                          <span>
                            {cotizandoId === imp.id ? 'Cerrar Propuesta' : 'Ofrecer Servicio y Costo'}
                          </span>
                        </button>
                      )}
                      {currentUser && !puedeOfrecerServicio && imp.estado === 'ABIERTO' && (
                        <button
                          type="button"
                          onClick={habilitarAmbosRoles}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-navy-950 font-bold text-xs rounded-xl border border-slate-300"
                        >
                          Activar modo Oficio para Cotizar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Incident Images Gallery */}
                  {imp.imagenes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase text-slate-500 block">
                        Imágenes del Imprevisto en Casa ({imp.imagenes.length}) — Haz clic para ampliar
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {imp.imagenes.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxImg(img)}
                            className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-32 text-left"
                          >
                            <img
                              src={img}
                              alt={`Suceso ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded">
                              Ver foto
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technician Quote Submission Form */}
                  {cotizandoId === imp.id && currentUser && (
                    <form
                      onSubmit={e => handleSubmitOffer(e, imp.id)}
                      className="p-4 sm:p-5 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-700" />
                          <span>Enviar tu Oferta y Costo de Reparación como Persona de Oficio</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setCotizandoId(null)}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Costo de Reparación (S/) *
                          </label>
                          <input
                            type="number"
                            min={10}
                            step="0.5"
                            value={montoOferta}
                            onChange={e => setMontoOferta(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Tiempo Estimado *
                          </label>
                          <input
                            type="text"
                            value={tiempoEstimado}
                            onChange={e => setTiempoEstimado(e.target.value)}
                            placeholder="Ej. Hoy en 1 hora"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Garantía (días) *
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={garantiaDias}
                            onChange={e => setGarantiaDias(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Tu Especialidad
                          </label>
                          <input
                            type="text"
                            value={especialidadOferta}
                            onChange={e => setEspecialidadOferta(e.target.value)}
                            placeholder="Ej. Electricista SENATI"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-4">
                          <label className="block font-bold text-slate-700 mb-1">
                            Detalle de lo que incluye tu reparación *
                          </label>
                          <textarea
                            rows={2}
                            value={mensajePropuesta}
                            onChange={e => setMensajePropuesta(e.target.value)}
                            placeholder="Explica cómo repararás el imprevisto, qué materiales o pruebas incluye..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      {ofertaError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-semibold">
                          {ofertaError}
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCotizandoId(null)}
                          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm"
                        >
                          Enviar Propuesta (S/ {Number(montoOferta || 0).toFixed(2)})
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Technician Offers Section (Stars + Exact Repair Price Prominently Shown) */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-navy-950 flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>
                          Ofertas de Personas de Oficio ({sortedOffers.length}) — Calificación y Monto de Reparación
                        </span>
                      </h4>
                      {imp.ordenGeneradaId && (
                        <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
                          Orden Escrow Generada: {imp.ordenGeneradaId}
                        </span>
                      )}
                    </div>

                    {sortedOffers.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                        Aún no hay propuestas de reparación. Las personas de oficio pueden enviar su costo aquí.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {sortedOffers.map(oferta => {
                          const isAccepted = oferta.estado === 'ACEPTADA';
                          const fullStars = Math.round(oferta.calificacionEstrellas);

                          return (
                            <div
                              key={oferta.id}
                              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                                isAccepted
                                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                                  : oferta.estado === 'DESCARTADA'
                                  ? 'bg-slate-50/70 border-slate-200 opacity-75'
                                  : 'bg-slate-50 border-slate-200 hover:border-navy-900/40'
                              }`}
                            >
                              <div className="space-y-2.5">
                                {/* Top Row: Technician Identity + Stars + Repair Cost Badge */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    {oferta.ofertanteFotoUrl && (currentRole === 'ADMIN' || currentUser?.id === oferta.ofertanteUsuarioId) ? (
                                      <img
                                        src={oferta.ofertanteFotoUrl}
                                        alt={oferta.ofertanteNombre}
                                        className="w-11 h-11 rounded-xl object-cover border border-slate-300 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-11 h-11 rounded-xl bg-navy-900 text-amber-300 flex items-center justify-center font-black text-base shrink-0">
                                        {oferta.ofertanteNombre.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {currentRole === 'ADMIN' ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              verPerfilPublico({
                                                userId: oferta.ofertanteUsuarioId,
                                                dni: oferta.ofertanteDni,
                                                nombre: oferta.ofertanteNombre
                                              })
                                            }
                                            className="font-extrabold text-sm text-navy-950 hover:text-sky-700 hover:underline text-left"
                                          >
                                            {oferta.ofertanteNombre}
                                          </button>
                                        ) : (
                                          <span className="font-extrabold text-sm text-navy-950 text-left">
                                            {oferta.ofertanteNombre}
                                          </span>
                                        )}
                                        {oferta.verificadoAdmin && (
                                          <span
                                            className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded"
                                            title="Identidad verificada por Administrador"
                                          >
                                            <ShieldCheck className="w-3 h-3" /> Verificado
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-600 block">
                                        {oferta.especialidad} · {oferta.institucionCertificadora}
                                      </span>

                                      {/* Prominent Star Rating */}
                                      <div className="flex items-center gap-1 mt-1">
                                        <div className="flex items-center">
                                          {[1, 2, 3, 4, 5].map(n => (
                                            <Star
                                              key={n}
                                              className={`w-3.5 h-3.5 ${
                                                n <= fullStars
                                                  ? 'fill-amber-400 text-amber-500'
                                                  : 'text-slate-300'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="font-black text-amber-700 text-xs">
                                          {oferta.calificacionEstrellas.toFixed(1)} ★
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                          ({oferta.numResenas} reseñas)
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Prominent Repair Price Box */}
                                  <div className="px-3 py-2 bg-white rounded-xl border-2 border-navy-900/15 text-right shrink-0 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                      Monto Reparación
                                    </span>
                                    <span className="text-lg font-black text-navy-950 tabular-nums">
                                      S/ {oferta.montoOferta.toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                                  {oferta.mensajePropuesta}
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                                  <span>⏱ {oferta.tiempoEstimado}</span>
                                  <span>🛡️ Garantía: {oferta.garantiaDias} días</span>
                                  <span>📅 {oferta.fechaOferta}</span>
                                </div>
                              </div>

                              {/* Selection & Contact Controls */}
                              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                {isAccepted ? (
                                  <span className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold rounded-xl flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Oferta Aceptada por el Cliente</span>
                                  </span>
                                ) : canSelectOffer ? (
                                  <button
                                    type="button"
                                    onClick={() => aceptarOfertaImprevisto(imp.id, oferta.id, true)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Elegir Técnico (S/ {oferta.montoOferta.toFixed(2)})</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-500 font-semibold">
                                    {oferta.estado === 'DESCARTADA'
                                      ? 'Otra oferta fue seleccionada'
                                      : 'Solo el autor o Admin elige'}
                                  </span>
                                )}

                                <div className="flex items-center gap-1.5">
                                  {currentRole === 'ADMIN' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        verPerfilPublico({
                                          userId: oferta.ofertanteUsuarioId,
                                          dni: oferta.ofertanteDni,
                                          nombre: oferta.ofertanteNombre
                                        })
                                      }
                                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-navy-950 border border-slate-300 rounded-lg font-bold flex items-center gap-1"
                                    >
                                      <User className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Perfil</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cleanTel = oferta.ofertanteTelefono.replace(/\D/g, '');
                                      const esAutorImprevisto = Boolean(
                                        currentUser &&
                                          (currentUser.id === imp.autorUsuarioId ||
                                            (Boolean(currentUser.dni) && currentUser.dni === imp.autorDni))
                                      );
                                      const esTrabajadorOferta = Boolean(
                                        currentUser &&
                                          (currentUser.id === oferta.ofertanteUsuarioId ||
                                            (Boolean(currentUser.dni) &&
                                              currentUser.dni === oferta.ofertanteDni))
                                      );
                                      const usaIdentidadAutor =
                                        esAutorImprevisto || esTrabajadorOferta;
                                      const convId = usaIdentidadAutor
                                        ? `IMP:${imp.id}:${cleanTel || oferta.ofertanteNombre}`
                                        : currentUser
                                        ? `IMP:${imp.id}:${cleanTel || oferta.ofertanteNombre}:${currentUser.id}`
                                        : undefined;

                                      void abrirChatDirecto({
                                        conversationId: convId,
                                        imprevistoId: imp.id,
                                        servicioTitulo: `Imprevisto: ${imp.titulo} (S/ ${oferta.montoOferta.toFixed(2)})`,
                                        clienteId: usaIdentidadAutor
                                          ? imp.autorUsuarioId
                                          : currentUser?.id,
                                        clienteNombre: usaIdentidadAutor
                                          ? imp.autorNombre
                                          : currentUser?.nombreCompleto,
                                        clienteDni: usaIdentidadAutor
                                          ? imp.autorDni
                                          : currentUser?.dni,
                                        clienteTelefono: usaIdentidadAutor
                                          ? imp.autorTelefono
                                          : currentUser?.telefonoWhatsapp,
                                        trabajadorId: oferta.ofertanteUsuarioId,
                                        trabajadorNombre: oferta.ofertanteNombre,
                                        trabajadorDni: oferta.ofertanteDni,
                                        trabajadorTelefono: oferta.ofertanteTelefono,
                                        trabajadorAvatar: '🛠️',
                                        trabajadorInstitucion: oferta.institucionCertificadora
                                      });
                                    }}
                                    className="px-2.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] border border-[#25D366]/40 rounded-lg font-bold flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-[#128C7E]" />
                                    <span>Chat Directo</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCallModal({
                                        tecnicoNombre: oferta.ofertanteNombre,
                                        tecnicoTelefono: oferta.ofertanteTelefono,
                                        servicioTitulo: `Cotización S/ ${oferta.montoOferta.toFixed(2)} - ${imp.titulo}`,
                                        region: imp.region,
                                        provincia: imp.provincia,
                                        distrito: imp.distrito,
                                        institucion: oferta.institucionCertificadora
                                      })
                                    }
                                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg font-bold flex items-center gap-1"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Llamar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal for Incident Images */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImg} alt="Detalle del imprevisto" className="w-full max-h-[80vh] object-contain bg-black" />
          </div>
        </div>
      )}

      {/* Culqi Payment Modal for S/ 5.00 Imprevisto Publication */}
      <CulqiCheckoutModal
        isOpen={showCulqiModal}
        onClose={() => setShowCulqiModal(false)}
        onSuccess={handleCulqiPaymentSuccess}
        amountSoles={PRECIO_PUBLICACION_IMPREVISTO}
        title="Publicar Imprevisto del Hogar"
        description={titulo.trim() || 'Reporte de imprevisto domiciliario'}
        concepto="IMPREVISTO"
        defaultEmail={currentUser?.email}
        defaultPhone={telefono || currentUser?.telefonoWhatsapp}
        customerName={currentUser?.nombreCompleto}
        initialMethod={metodoPagoImprevisto}
      />
    </div>
  );
};
