import React, { useState, useEffect } from 'react';
import { useConecta } from '../context/ConectaContext';
import { DatosVisita } from '../types';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { formatUbicacion, inferUbicacionPeru } from '../data/peruUbigeo';
import { resolveEmailServicio } from '../utils/whatsappSolicitud';
import {
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Phone,
  User,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LocateFixed,
  ExternalLink,
  Send,
  Mail
} from 'lucide-react';

const getDefaultVisitDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const QUICK_HOURS = ['08:30', '10:00', '12:00', '15:00', '17:00', '19:00'];

export const CarritoView: React.FC = () => {
  const {
    carrito,
    currentUser,
    usuarios,
    quitarDelCarrito,
    actualizarCantidadItem,
    confirmarOrdenYEscrow,
    setActiveTab,
    setShowAuthModal,
    showToast
  } = useConecta();

  // Form states for visit (synced to currentUser)
  const initialUbi = inferUbicacionPeru(
    currentUser?.distrito,
    currentUser?.provincia,
    currentUser?.region
  );
  const [clienteNombre, setClienteNombre] = useState(currentUser?.nombreCompleto || '');
  const [clienteDni, setClienteDni] = useState(currentUser?.dni || '');
  const [region, setRegion] = useState<string>(initialUbi.region);
  const [provincia, setProvincia] = useState<string>(initialUbi.provincia);
  const [distrito, setDistrito] = useState<string>(initialUbi.distrito);
  const [direccion, setDireccion] = useState(currentUser?.direccion || '');
  const [referencia, setReferencia] = useState('A 2 cuadras del parque principal / avenida principal');
  const [fechaVisita, setFechaVisita] = useState<string>(getDefaultVisitDate());
  const [horaVisita, setHoraVisita] = useState<string>('10:00');
  const [turno, setTurno] = useState<'Mañana (08:00 - 12:00)' | 'Tarde (14:00 - 18:00)' | 'Atención de Urgencia'>(
    'Mañana (08:00 - 12:00)'
  );
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [enlaceMapa, setEnlaceMapa] = useState('');
  const [ubicacionConfirmadaManual, setUbicacionConfirmadaManual] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState(currentUser?.telefonoWhatsapp || '');
  const [clienteEmail, setClienteEmail] = useState(currentUser?.email || '');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorValidation, setErrorValidation] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const ubi = inferUbicacionPeru(currentUser.distrito, currentUser.provincia, currentUser.region);
    setClienteNombre(currentUser.nombreCompleto);
    setClienteDni(currentUser.dni);
    setRegion(ubi.region);
    setProvincia(ubi.provincia);
    setDistrito(ubi.distrito);
    setDireccion(currentUser.direccion);
    setTelefonoWhatsapp(currentUser.telefonoWhatsapp);
    setClienteEmail(currentUser.email);
  }, [currentUser]);

  const handleHoraChange = (val: string) => {
    setHoraVisita(val);
    const hourNum = Number(val.split(':')[0]);
    if (!Number.isNaN(hourNum)) {
      if (hourNum < 13) setTurno('Mañana (08:00 - 12:00)');
      else setTurno('Tarde (14:00 - 18:00)');
    }
  };

  const handleDetectarGps = () => {
    setGeoMessage(null);
    if (!navigator.geolocation) {
      setGeoMessage('Tu navegador no permite geolocalización automática; usa la dirección exacta o pega un enlace de Google Maps.');
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoordenadas({ lat, lng });
        setEnlaceMapa(`https://www.google.com/maps?q=${lat},${lng}`);
        setUbicacionConfirmadaManual(true);
        setGeolocating(false);
        setGeoMessage(`Ubicación GPS capturada (${lat}, ${lng}).`);
        showToast('Ubicación del Domicilio Lista', 'Se adjuntaron tus coordenadas GPS a la solicitud.', 'success');
      },
      () => {
        setGeolocating(false);
        setGeoMessage(
          'No se pudo obtener permiso de GPS. Puedes confirmar igualmente tu domicilio seleccionando Región, Provincia, Distrito y Dirección exacta.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const referencialTotal = carrito.reduce(
    (sum, it) => sum + it.servicio.precioBase * it.cantidadTurnos,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidation(null);

    if (currentUser && !clienteNombre.trim()) {
      setErrorValidation('Por favor ingresa el nombre de quien solicita el encargo.');
      return;
    }
    if (!fechaVisita) {
      setErrorValidation('Por favor selecciona la fecha del encargo.');
      return;
    }
    if (!horaVisita) {
      setErrorValidation('Por favor indica la hora exacta en que necesitas al trabajador.');
      return;
    }
    if (!direccion.trim()) {
      setErrorValidation('Por favor ingresa la dirección exacta de dónde está el domicilio.');
      return;
    }
    if (!telefonoWhatsapp.trim()) {
      setErrorValidation('Por favor ingresa tu teléfono o WhatsApp para coordinar con el trabajador.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const datos: DatosVisita = {
        clienteNombre: currentUser ? clienteNombre.trim() : 'Anónimo (No registrado)',
        clienteDni: currentUser ? clienteDni.trim() : '',
        region,
        provincia,
        distrito,
        direccion: direccion.trim(),
        referencia: referencia.trim() || 'Sin referencia adicional',
        fechaVisita,
        horaVisita,
        coordenadas,
        enlaceMapa: enlaceMapa.trim() || undefined,
        turno,
        telefonoWhatsapp: telefonoWhatsapp.trim(),
        clienteEmail: clienteEmail.trim() || undefined,
        notasAdicionales: notasAdicionales.trim() || undefined
      };

      confirmarOrdenYEscrow(datos, 'SIN_COBRO_SOLICITUD');
      setIsProcessing(false);
    }, 450);
  };

  if (carrito.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 max-w-xl mx-auto text-center border border-slate-200 shadow-sm space-y-4">
        <div className="w-20 h-20 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-3xl">
          📋
        </div>
        {currentUser ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-navy-950">
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span>Solicitudes de: {currentUser.nombreCompleto} (DNI {currentUser.dni})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-900">
            <span>Vista de Visitante · Cada usuario guarda sus propias solicitudes al iniciar sesión</span>
          </div>
        )}
        <h2 className="text-xl font-bold text-slate-900">Tu solicitud está vacía</h2>
        <p className="text-xs text-slate-500">
          Selecciona un especialista en el catálogo para indicar la hora y la ubicación de tu domicilio sin ningún cobro previo.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('catalogo')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-950 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explorar Catálogo de Especialistas</span>
          </button>
          {!currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('acceso')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-navy-950 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const mapsQueryUrl =
    enlaceMapa.trim() ||
    (coordenadas
      ? `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${direccion}, ${distrito}, ${provincia}, ${region}, Peru`
        )}`);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title & Back Link */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => setActiveTab('catalogo')}
            className="text-xs font-semibold text-slate-500 hover:text-navy-900 flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Catálogo</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Solicitud de Encargo a Domicilio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Indica la <strong>hora del encargo</strong> y selecciona la <strong>ubicación exacta del domicilio</strong>. En la solicitud no se cobra ningún monto al trabajador ni al solicitante.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('acceso')}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs rounded-xl shadow-2xs"
            >
              Iniciar Sesión (Opcional)
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sin Cobro en Solicitud (S/ 0.00)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Selected Services + Hour & Domicile Location Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Selected Specialists */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Trabajador / Servicio Solicitado</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  {carrito.length}
                </span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Sin comisión al trabajador
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {carrito.map(item => (
                <div
                  key={item.servicioId}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={item.servicio.imagen}
                        alt={item.servicio.titulo}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                        {item.servicio.oficioLabel}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {item.servicio.titulo}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>
                          {item.servicio.tecnicoAvatar} {item.servicio.tecnicoNombre}
                        </span>
                        <span>·</span>
                        <span className="text-navy-900 font-semibold">
                          {item.servicio.institucionCertificadora}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => actualizarCantidadItem(item.servicioId, item.cantidadTurnos - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                        title="Disminuir cantidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.cantidadTurnos}
                      </span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidadItem(item.servicioId, item.cantidadTurnos + 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                        title="Aumentar cantidad"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[92px]">
                      <div className="text-xs font-extrabold text-navy-950 tabular-nums">
                        Ref. S/ {(item.servicio.precioBase * item.cantidadTurnos).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        S/ 0.00 en solicitud
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitarDelCarrito(item.servicioId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Quitar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 1: Hora y Fecha del Encargo (Required) */}
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-300 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>1. Fecha y Hora en que Necesitas el Encargo *</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                El trabajador visualizará esta hora exacta en su orden para confirmar si está disponible.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Fecha del Encargo *
                </label>
                <input
                  type="date"
                  value={fechaVisita}
                  min={getDefaultVisitDate()}
                  onChange={e => setFechaVisita(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Hora Exacta Solicitada *
                </label>
                <input
                  type="time"
                  value={horaVisita}
                  onChange={e => handleHoraChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-amber-50/70 border-2 border-amber-400 rounded-xl font-mono font-extrabold text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Modalidad / Turno</label>
                <select
                  value={turno}
                  onChange={e => setTurno(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
                >
                  <option value="Mañana (08:00 - 12:00)">Mañana (08:00 - 12:00)</option>
                  <option value="Tarde (14:00 - 18:00)">Tarde (14:00 - 18:00)</option>
                  <option value="Atención de Urgencia">Atención de Urgencia</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Horas rápidas sugeridas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_HOURS.map(hr => (
                  <button
                    key={hr}
                    type="button"
                    onClick={() => handleHoraChange(hr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      horaVisita === hr
                        ? 'bg-navy-900 text-amber-300 border-navy-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {hr} hrs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Ubicación Exacta del Domicilio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>2. Ubicación de Dónde Está el Domicilio *</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Selecciona región, provincia, distrito y dirección exacta (o usa tu ubicación GPS).
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectarGps}
                disabled={geolocating}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
              >
                <LocateFixed className={`w-4 h-4 text-sky-600 ${geolocating ? 'animate-spin' : ''}`} />
                <span>{geolocating ? 'Ubicando...' : 'Usar Mi Ubicación (GPS)'}</span>
              </button>
            </div>

            {geoMessage && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center justify-between gap-2">
                <span>{geoMessage}</span>
                {coordenadas && (
                  <a
                    href={mapsQueryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Ver mapa</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {!currentUser && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
                <div className="space-y-0.5">
                  <p className="font-bold">Estás enviando una solicitud sin cuenta registrada</p>
                  <p className="text-[11px] text-amber-800">
                    Si continúas sin registrarte, aparecerás como <strong>Anónimo (No registrado)</strong> y para usar el Chat Directo o Llamar tendrás que registrarte primero.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal('register');
                    setActiveTab('acceso');
                  }}
                  className="px-3.5 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
                >
                  Registrarme ahora
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />{' '}
                  {currentUser ? 'Nombre del Solicitante *' : 'Identidad del Solicitante'}
                </label>
                {currentUser ? (
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={e => setClienteNombre(e.target.value)}
                    placeholder="Ej. Marina Gutiérrez"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value="Anónimo (No registrado)"
                    readOnly
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> DNI / Documento de Identidad
                </label>
                <input
                  type="text"
                  value={currentUser ? clienteDni : ''}
                  onChange={e => setClienteDni(e.target.value)}
                  placeholder={currentUser ? 'Ej. 44592019' : 'Requiere registro'}
                  disabled={!currentUser}
                  maxLength={15}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> Región, Provincia y Distrito del Domicilio *
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
                    setUbicacionConfirmadaManual(true);
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Dirección Exacta del Domicilio (Calle / Av. / N° / Dpto / Mz-Lt) *
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={e => {
                    setDireccion(e.target.value);
                    setUbicacionConfirmadaManual(true);
                  }}
                  placeholder="Ej. Av. Arequipa 1840, Dpto. 402"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Referencia para Llegar al Domicilio *
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={e => setReferencia(e.target.value)}
                  placeholder="Ej. Frente al parque, casa portón blanco"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Enlace de Mapa / Coordenadas (Opcional)
                </label>
                <input
                  type="text"
                  value={enlaceMapa}
                  onChange={e => setEnlaceMapa(e.target.value)}
                  placeholder="Pega enlace de Google Maps si deseas"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              {/* Interactive Location Confirmation Box */}
              <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Ubicación Seleccionada para el Trabajador
                  </span>
                  <span className="font-bold text-navy-950 block">
                    {direccion.trim() || 'Ingresa tu dirección'} · {formatUbicacion(distrito, provincia, region)}
                  </span>
                  {coordenadas ? (
                    <span className="text-[11px] font-mono text-emerald-700 block">
                      ✓ Pin GPS adjunto: {coordenadas.lat}, {coordenadas.lng}
                    </span>
                  ) : ubicacionConfirmadaManual ? (
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      ✓ Ubicación de domicilio seleccionada
                    </span>
                  ) : null}
                </div>
                {direccion.trim() && (
                  <a
                    href={mapsQueryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-navy-950 inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Verificar en Mapa</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Teléfono / WhatsApp de Contacto *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-200 text-slate-600 border border-r-0 border-slate-300 rounded-l-xl font-mono">
                    +51
                  </span>
                  <input
                    type="tel"
                    value={telefonoWhatsapp}
                    onChange={e => setTelefonoWhatsapp(e.target.value)}
                    placeholder="966 123 456"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" /> Correo del Solicitante
                </label>
                <input
                  type="email"
                  value={clienteEmail}
                  onChange={e => setClienteEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Detalles del Encargo (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notasAdicionales}
                  onChange={e => setNotasAdicionales(e.target.value)}
                  placeholder="Ej. Necesito que traiga escalera o repuesto estándar..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Zero-Charge Summary & Submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md sticky top-28 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-950 flex items-center justify-between gap-2">
                <span>Resumen de la Solicitud</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-md">
                  Sin Cobro (S/ 0.00)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                En la solicitud no se cobra ningún monto al trabajador ni al solicitante.
              </p>
            </div>

            {/* Live Schedule & Location Preview for Worker */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
                Vista que recibirá el trabajador para aceptar:
              </span>
              <div className="flex items-center gap-2 text-navy-950 font-bold">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Fecha: {fechaVisita || 'Por definir'}</span>
              </div>
              <div className="flex items-center gap-2 text-navy-950 font-bold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Hora solicitada: {horaVisita ? `${horaVisita} hrs` : 'Por definir'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Domicilio:</strong> {direccion.trim() || 'Por ingresar'} ({formatUbicacion(distrito, provincia, region)})
                </span>
              </div>
            </div>

            {/* Transparent Zero-Fee Breakdown */}
            <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tarifa referencial del servicio:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  S/ {referencialTotal.toFixed(2)} (referencial)
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Comisión / Cobro al trabajador en solicitud:</span>
                <span className="font-mono font-bold">S/ 0.00</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Cobro al enviar esta solicitud:</span>
                <span className="font-mono font-bold">S/ 0.00</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-navy-950 block">
                    Total a Pagar Ahora:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sin pagos ni descuentos al trabajador
                  </span>
                </div>
                <span className="text-3xl font-black text-emerald-600 tabular-nums">
                  S/ 0.00
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#eefcf2] border border-[#25D366]/60 rounded-xl space-y-2 text-[11px] text-emerald-950">
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>La solicitud se enviará por los 3 canales al trabajador:</span>
              </div>
              <ul className="space-y-1 pl-1 text-emerald-900">
                <li>
                  <strong>1. Página Web del Trabajador:</strong> Bandeja de órdenes en su perfil y Mis Órdenes.
                </li>
                <li>
                  <strong>2. Correo Electrónico:</strong>{' '}
                  <span className="font-mono font-bold">
                    {carrito[0]?.servicio
                      ? resolveEmailServicio(carrito[0].servicio, usuarios)
                      : 'correo@trabajador.pe'}
                  </span>
                </li>
                <li>
                  <strong>3. WhatsApp:</strong>{' '}
                  <span className="font-mono font-bold">
                    +51 {carrito[0]?.servicio.tecnicoTelefono || '966 123 456'}
                  </span>
                </li>
              </ul>
            </div>

            {errorValidation && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorValidation}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando Solicitud al Trabajador...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitud (S/ 0.00 · Sin Cobro)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
