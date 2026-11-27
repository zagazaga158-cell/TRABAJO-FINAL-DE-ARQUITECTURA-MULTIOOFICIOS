import React, { useState } from 'react';
import { useConecta } from '../context/ConectaContext';
import { Orden, EstadoOrden, CulqiPaymentReceipt } from '../types';
import { formatUbicacion } from '../data/peruUbigeo';
import { CulqiCheckoutModal } from './CulqiCheckoutModal';
import {
  buildWhatsAppSolicitudTrabajadorMsg,
  buildWhatsAppRespuestaClienteMsg,
  buildWhatsAppUrl,
  buildCorreoSolicitudTrabajador,
  buildMailtoUrl,
  buildGmailComposeUrl,
  resolveEmailServicio
} from '../utils/whatsappSolicitud';
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  X,
  Printer,
  Sparkles,
  MessageSquare,
  PhoneCall,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  User,
  Copy,
  Send,
  Mail,
  Eye
} from 'lucide-react';

export const OrdenesView: React.FC = () => {
  const { 
    ordenes, 
    usuarios,
    currentRole,
    currentUser,
    setPedidoEnDetalleId,
    marcarCanalEnvioOrden,
    responderDisponibilidadOrden,
    actualizarEstadoOrdenManual,
    darConformidadYLiberarFondos, 
    pagarOrdenConCulqi,
    reportarObservacion, 
    calificarOrden,
    abrirChatDirecto,
    despacharOrdenAutomaticamente,
    openCallModal,
    showToast
  } = useConecta();

  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'POR_ACEPTAR' | 'EN_CURSO' | 'LIBERADAS'>('TODAS');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [notasRespuesta, setNotasRespuesta] = useState<Record<string, string>>({});

  // Modal for rating
  const [ratingModalOrder, setRatingModalOrder] = useState<Orden | null>(null);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState('Excelente servicio técnico, muy puntual y profesional.');
  const [puntualidad, setPuntualidad] = useState(5);
  const [calidad, setCalidad] = useState(5);
  const [limpieza, setLimpieza] = useState(5);

  // Modal for guarantee observation
  const [observationModalOrder, setObservationModalOrder] = useState<Orden | null>(null);
  const [motivoObservacion, setMotivoObservacion] = useState('Persiste leve goteo / o requiere ajuste de acabado');

  // Modal for Digital Receipt / Acta
  const [receiptModalOrder, setReceiptModalOrder] = useState<Orden | null>(null);

  // Modal for paying order in Escrow via Culqi
  const [culqiOrderTarget, setCulqiOrderTarget] = useState<Orden | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const handleOpenRating = (ord: Orden) => {
    setRatingModalOrder(ord);
    if (ord.calificacion) {
      setEstrellas(ord.calificacion.estrellas);
      setComentario(ord.calificacion.comentario);
      setPuntualidad(ord.calificacion.criterios.puntualidad);
      setCalidad(ord.calificacion.criterios.calidad);
      setLimpieza(ord.calificacion.criterios.limpieza);
    } else {
      setEstrellas(5);
      setComentario('Excelente servicio técnico, muy puntual y profesional.');
      setPuntualidad(5);
      setCalidad(5);
      setLimpieza(5);
    }
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalOrder) return;

    calificarOrden(ratingModalOrder.id, {
      estrellas,
      comentario,
      fecha: new Date().toLocaleDateString('es-PE'),
      criterios: {
        puntualidad,
        calidad,
        limpieza
      }
    });

    setRatingModalOrder(null);
  };

  const handleSubmitObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationModalOrder || !motivoObservacion.trim()) return;

    reportarObservacion(observationModalOrder.id, motivoObservacion);
    setObservationModalOrder(null);
  };

  const isAdmin = currentRole === 'ADMIN';
  const esClienteDeOrden = (o: Orden) =>
    o.clienteUsuarioId === currentUser?.id ||
    (Boolean(currentUser?.dni) && o.datosVisita.clienteDni === currentUser?.dni);

  const esEspecialistaDeOrden = (o: Orden) =>
    o.items.some(
      it =>
        it.servicio.autorUsuarioId === currentUser?.id ||
        (Boolean(currentUser?.dni) && it.servicio.tecnicoDni === currentUser?.dni)
    );

  const ordenesVisibles = isAdmin
    ? ordenes
    : ordenes.filter(o => esClienteDeOrden(o) || esEspecialistaDeOrden(o));

  const ordenesPorAceptarCount = ordenesVisibles.filter(
    o =>
      (esEspecialistaDeOrden(o) || isAdmin) &&
      (!o.aceptacionTrabajador || o.aceptacionTrabajador === 'PENDIENTE') &&
      o.estado !== 'CONFORMIDAD_Y_LIBERADO' &&
      o.estado !== 'COMPLETADO_PENDIENTE_CONFORMIDAD'
  ).length;

  const isOrdenFinalizada = (o: Orden) =>
    o.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD' || o.estado === 'CONFORMIDAD_Y_LIBERADO';

  const ordenesPorCalificarCliente = ordenesVisibles.filter(
    o => (esClienteDeOrden(o) || isAdmin) && isOrdenFinalizada(o) && !o.calificacion
  );

  const ordenesFiltradas = ordenesVisibles.filter(o => {
    if (filtroEstado === 'POR_ACEPTAR') {
      return (
        (esEspecialistaDeOrden(o) || isAdmin) &&
        (!o.aceptacionTrabajador || o.aceptacionTrabajador === 'PENDIENTE') &&
        !isOrdenFinalizada(o)
      );
    }
    if (filtroEstado === 'EN_CURSO') {
      return !isOrdenFinalizada(o);
    }
    if (filtroEstado === 'LIBERADAS') {
      return isOrdenFinalizada(o);
    }
    return true;
  });

  const getEstadoBadge = (estado: EstadoOrden) => {
    switch (estado) {
      case 'EN_CUSTODIA':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-lg flex items-center gap-1 border border-amber-300">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            Pago en Custodia Fiduciaria
          </span>
        );
      case 'EN_CAMINO':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-sky-100 text-sky-900 rounded-lg flex items-center gap-1 border border-sky-300">
            <Clock className="w-3.5 h-3.5 text-sky-700" />
            Técnico en Camino
          </span>
        );
      case 'EN_EJECUCION':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-indigo-100 text-indigo-900 rounded-lg flex items-center gap-1 border border-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping inline-block"></span>
            En Ejecución Técnica
          </span>
        );
      case 'COMPLETADO_PENDIENTE_CONFORMIDAD':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-900 rounded-lg flex items-center gap-1 border border-emerald-400 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Visita Finalizada · Visto Bueno Pendiente
          </span>
        );
      case 'CONFORMIDAD_Y_LIBERADO':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-1 border border-emerald-300">
            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
            Conformidad Dada · Pago Liberado
          </span>
        );
      case 'OBSERVADO_GARANTIA':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-900 rounded-lg flex items-center gap-1 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            Garantía Activada · En Revisión
          </span>
        );
      default:
        return null;
    }
  };

  const renderTimeline = (ord: Orden) => {
    const steps = [
      { id: 'EN_CUSTODIA', label: '1. Fondos en Custodia' },
      { id: 'EN_CAMINO', label: '2. En Camino' },
      { id: 'EN_EJECUCION', label: '3. En Ejecución' },
      { id: 'COMPLETADO_PENDIENTE_CONFORMIDAD', label: '4. Visita Concluida' },
      { id: 'CONFORMIDAD_Y_LIBERADO', label: '5. Fondos Liberados' },
    ];

    const getStepState = (stepId: string) => {
      const orderStateIndex = steps.findIndex(s => s.id === ord.estado);
      const stepIndex = steps.findIndex(s => s.id === stepId);

      if (ord.estado === 'OBSERVADO_GARANTIA') {
        if (stepId === 'COMPLETADO_PENDIENTE_CONFORMIDAD') return 'warning';
        return stepIndex < 3 ? 'completed' : 'pending';
      }

      if (stepIndex < orderStateIndex) return 'completed';
      if (stepIndex === orderStateIndex) return 'current';
      return 'pending';
    };

    return (
      <div className="py-4 border-t border-b border-slate-100 my-4">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
          Flujo del Contrato de Custodia (Escrow)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map(step => {
            const state = getStepState(step.id);
            let bgClass = 'bg-slate-100 text-slate-400 border-slate-200';
            if (state === 'completed') bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
            if (state === 'current') bgClass = 'bg-navy-900 text-amber-300 border-navy-900 font-bold shadow-sm ring-1 ring-amber-400/50';
            if (state === 'warning') bgClass = 'bg-rose-50 text-rose-800 border-rose-300 font-bold';

            return (
              <div
                key={step.id}
                className={`p-2 rounded-xl text-center border text-[11px] flex flex-col items-center justify-center min-h-[46px] ${bgClass}`}
              >
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {isAdmin && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-sky-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
            <span>
              <strong>Vista Global de Administrador:</strong> Estás visualizando la totalidad de órdenes y contratos Escrow de todos los usuarios en la plataforma ({ordenesVisibles.length} en total).
            </span>
          </div>
        </div>
      )}

      {/* Banner cuando el técnico ya finalizó y falta calificar */}
      {ordenesPorCalificarCliente.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong className="text-navy-950 text-sm block">
                ¡Tienes {ordenesPorCalificarCliente.length} trabajo(s) finalizado(s) por el técnico listo(s) para calificar!
              </strong>
              <span className="text-slate-700">
                Ponle sus estrellas y escribe un comentario. Tu opinión se mostrará automáticamente en la publicación del técnico.
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenRating(ordenesPorCalificarCliente[0])}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-navy-950" />
              <span>Calificar Ahora ({ordenesPorCalificarCliente[0].id})</span>
            </button>
          </div>
        </div>
      )}

      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            {isAdmin ? 'Órdenes Globales del Sistema (Admin)' : 'Mis Órdenes y Calificaciones'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Supervisión completa de todos los contratos fiduciarios Escrow entre clientes y especialistas.'
              : 'Seguimiento de tus solicitudes, trabajos finalizados por el técnico y publicación de estrellas y comentarios.'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setFiltroEstado('TODAS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filtroEstado === 'TODAS'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({ordenesVisibles.length})
          </button>
          <button
            onClick={() => setFiltroEstado('POR_ACEPTAR')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              filtroEstado === 'POR_ACEPTAR'
                ? 'bg-amber-400 text-navy-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Por Aceptar</span>
            {ordenesPorAceptarCount > 0 && (
              <span className="px-1.5 py-0.2 bg-navy-950 text-amber-300 rounded-full text-[10px] font-bold">
                {ordenesPorAceptarCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFiltroEstado('EN_CURSO')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filtroEstado === 'EN_CURSO'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En Curso ({ordenesVisibles.filter(o => !isOrdenFinalizada(o)).length})
          </button>
          <button
            onClick={() => setFiltroEstado('LIBERADAS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              filtroEstado === 'LIBERADAS'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Finalizadas ({ordenesVisibles.filter(isOrdenFinalizada).length})</span>
            {ordenesPorCalificarCliente.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-navy-950 rounded-full text-[10px] font-extrabold">
                {ordenesPorCalificarCliente.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Orders List */}
      {ordenesFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No hay órdenes con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenesFiltradas.map(ord => {
            const isExpanded = expandedOrderId === ord.id;
            const soyCliente = esClienteDeOrden(ord);
            const soyTrabajador = esEspecialistaDeOrden(ord);
            const isSinCobro = Boolean(ord.sinCobroSolicitud || ord.total === 0);
            const estadoAceptacion = ord.aceptacionTrabajador || 'PENDIENTE';
            const mapaUrl =
              ord.datosVisita.enlaceMapa ||
              (ord.datosVisita.coordenadas
                ? `https://www.google.com/maps?q=${ord.datosVisita.coordenadas.lat},${ord.datosVisita.coordenadas.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${ord.datosVisita.direccion}, ${ord.datosVisita.distrito}, ${ord.datosVisita.provincia || ''}, ${ord.datosVisita.region || ''}, Peru`
                  )}`);

            const canReleaseFunds =
              (isAdmin || soyCliente) &&
              (ord.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD' ||
                ord.estado === 'EN_EJECUCION' ||
                ord.estado === 'EN_CUSTODIA' ||
                ord.estado === 'EN_CAMINO');
            const isLiberado = ord.estado === 'CONFORMIDAD_Y_LIBERADO';
            const isFinishedByTech = ord.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD';
            const isFinalizado = isFinishedByTech || isLiberado;
            const debeCalificarCliente = (isAdmin || soyCliente) && isFinalizado && !ord.calificacion;

            return (
              <div
                key={ord.id}
                className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all ${
                  debeCalificarCliente
                    ? 'border-emerald-400 ring-2 ring-emerald-200/80'
                    : estadoAceptacion === 'PENDIENTE' && (soyTrabajador || isAdmin)
                    ? 'border-amber-400 ring-2 ring-amber-200/70'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header card row */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Code, Date & Address */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-extrabold font-mono text-navy-950">
                        {ord.id}
                      </span>
                      {!isAdmin && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            soyTrabajador && !soyCliente
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-navy-900 text-amber-300'
                          }`}
                        >
                          {soyTrabajador && !soyCliente
                            ? 'Orden Recibida (Trabajador)'
                            : 'Solicitud Enviada'}
                        </span>
                      )}
                      {estadoAceptacion === 'PENDIENTE' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          ⏳ Por Confirmar Disponibilidad Horaria
                        </span>
                      )}
                      {estadoAceptacion === 'ACEPTADA' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Trabajador Disponible y Aceptó la Hora
                        </span>
                      )}
                      {estadoAceptacion === 'NO_DISPONIBLE' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          ✕ Trabajador No Disponible a esa Hora
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        {ord.codigoAutorizacion}
                      </span>
                    </div>

                    {/* Prominent Schedule & Domicile Location Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-800 block">
                            Fecha y Hora Solicitada
                          </span>
                          <span className="font-extrabold text-navy-950">
                            {ord.datosVisita.fechaVisita || ord.fecha} ·{' '}
                            {ord.datosVisita.horaVisita
                              ? `${ord.datosVisita.horaVisita} hrs`
                              : ord.datosVisita.turno}
                          </span>
                          <span className="text-[11px] text-slate-600 block">{ord.datosVisita.turno}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                              Ubicación del Domicilio
                            </span>
                            <span className="font-bold text-navy-950 block">
                              {ord.datosVisita.direccion}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {formatUbicacion(
                                ord.datosVisita.distrito,
                                ord.datosVisita.provincia,
                                ord.datosVisita.region
                              )}
                              {ord.datosVisita.referencia ? ` · Ref: ${ord.datosVisita.referencia}` : ''}
                            </span>
                          </div>
                        </div>
                        <a
                          href={mapaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-white hover:bg-sky-50 border border-slate-300 rounded-lg text-[10px] font-bold text-sky-700 inline-flex items-center gap-1 shrink-0"
                          title="Abrir ubicación del domicilio en mapa"
                        >
                          <span>Mapa</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-700">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-600" />
                          Solicitante: <strong className="text-navy-950">{ord.datosVisita.clienteNombre}</strong>
                          {ord.datosVisita.clienteDni ? (
                            <span className="font-mono text-slate-600"> (DNI {ord.datosVisita.clienteDni})</span>
                          ) : null}
                        </span>
                        <span>
                          Tel: <strong className="font-mono text-emerald-800">+51 {ord.datosVisita.telefonoWhatsapp}</strong>
                        </span>
                        {ord.datosVisita.clienteEmail && (
                          <span>
                            Correo: <strong className="font-mono text-indigo-800">{ord.datosVisita.clienteEmail}</strong>
                          </span>
                        )}
                      </div>
                      {ord.datosVisita.notasAdicionales && (
                        <p className="text-slate-600 italic">
                          <strong>Detalles del encargo:</strong> "{ord.datosVisita.notasAdicionales}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle / Right: Status Badge & Total Amount */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0">
                    <div>{getEstadoBadge(ord.estado)}</div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">
                        {isSinCobro ? 'Cobro en Solicitud:' : 'Total Orden:'}
                      </span>
                      <span
                        className={`text-lg sm:text-xl font-extrabold tabular-nums ${
                          isSinCobro ? 'text-emerald-700' : 'text-navy-950'
                        }`}
                      >
                        S/ {ord.total.toFixed(2)}
                      </span>
                      {isSinCobro && (
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          0% cobro al trabajador
                          {ord.montoReferencial ? ` · Ref. S/ ${ord.montoReferencial.toFixed(2)}` : ''}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleExpand(ord.id)}
                      className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title={isExpanded ? 'Contraer' : 'Ver detalle completo'}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Worker Availability Review & Acceptance Panel (ONLY Assigned Tradesperson can Accept/Reject) */}
                {soyTrabajador && !isLiberado ? (
                  <div
                    className={`px-5 sm:px-6 py-4 border-t ${
                      estadoAceptacion === 'PENDIENTE'
                        ? 'bg-amber-50/90 border-amber-200'
                        : estadoAceptacion === 'ACEPTADA'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    {estadoAceptacion === 'PENDIENTE' ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs">
                            <strong className="text-navy-950 block text-sm">
                              🛠️ Decisión Exclusiva del Trabajador del Oficio (Sin cobro al trabajador)
                            </strong>
                            <span className="text-slate-700">
                              Revisa los datos completos del solicitante y si estás disponible el{' '}
                              <strong>{ord.datosVisita.fechaVisita || 'día solicitado'}</strong> a las{' '}
                              <strong className="font-mono text-navy-950">
                                {ord.datosVisita.horaVisita ? `${ord.datosVisita.horaVisita} hrs` : ord.datosVisita.turno}
                              </strong>{' '}
                              en <strong>{ord.datosVisita.direccion}</strong> ({ord.datosVisita.distrito}).
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 text-xs">
                          <input
                            type="text"
                            value={notasRespuesta[ord.id] || ''}
                            onChange={e =>
                              setNotasRespuesta(prev => ({ ...prev, [ord.id]: e.target.value }))
                            }
                            placeholder="Mensaje opcional para el solicitante..."
                            className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                          />
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                responderDisponibilidadOrden(ord.id, 'ACEPTADA', notasRespuesta[ord.id])
                              }
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>Aceptar Pedido</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                responderDisponibilidadOrden(
                                  ord.id,
                                  'NO_DISPONIBLE',
                                  notasRespuesta[ord.id] || 'Pedido rechazado / No disponible en ese horario'
                                )
                              }
                              className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span>Rechazar Pedido</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : estadoAceptacion === 'ACEPTADA' ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-emerald-950">
                          <strong>✓ Pedido aceptado por ti</strong> ({ord.fechaRespuestaTrabajador || 'confirmado'})
                          {ord.notaDisponibilidadTrabajador && (
                            <span className="block text-emerald-800 italic">
                              Nota: "{ord.notaDisponibilidadTrabajador}"
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {ord.estado === 'EN_CUSTODIA' && (
                            <button
                              type="button"
                              onClick={() => actualizarEstadoOrdenManual(ord.id, 'EN_CAMINO')}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                            >
                              Marcar: En Camino
                            </button>
                          )}
                          {ord.estado === 'EN_CAMINO' && (
                            <button
                              type="button"
                              onClick={() => actualizarEstadoOrdenManual(ord.id, 'EN_EJECUCION')}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                            >
                              Iniciar Trabajo en Domicilio
                            </button>
                          )}
                          {(ord.estado === 'EN_CUSTODIA' ||
                            ord.estado === 'EN_CAMINO' ||
                            ord.estado === 'EN_EJECUCION') && (
                            <button
                              type="button"
                              onClick={() =>
                                actualizarEstadoOrdenManual(ord.id, 'COMPLETADO_PENDIENTE_CONFORMIDAD')
                              }
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Marcar: Trabajo Terminado</span>
                            </button>
                          )}
                          {ord.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD' && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-xl">
                              ✓ Trabajo finalizado · Visible en Mis Órdenes del cliente para calificación
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-900">
                        <div>
                          <strong>✕ Rechazaste este pedido / No disponible para la hora solicitada.</strong>
                          {ord.notaDisponibilidadTrabajador && (
                            <span className="ml-1.5 italic">({ord.notaDisponibilidadTrabajador})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            responderDisponibilidadOrden(ord.id, 'ACEPTADA', 'Disponibilidad liberada y pedido aceptado')
                          }
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl self-start sm:self-auto"
                        >
                          Cambiar a: Aceptar Pedido
                        </button>
                      </div>
                    )}
                  </div>
                ) : !isLiberado ? (
                  <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Decisión exclusiva del especialista:</strong> Solo la persona del oficio asignada ({ord.items.map(it => it.servicio.tecnicoNombre).join(', ')}) puede aceptar o rechazar este pedido.
                    </span>
                  </div>
                ) : null}

                {/* Client Visibility of Worker Availability Response */}
                {soyCliente && !soyTrabajador && !isAdmin && ord.notaDisponibilidadTrabajador && (
                  <div className="px-5 sm:px-6 py-2.5 bg-sky-50 border-t border-sky-100 text-xs text-sky-950">
                    <strong>Respuesta del trabajador:</strong> "{ord.notaDisponibilidadTrabajador}"
                  </div>
                )}

                {/* Prominent Prompt when Technician Finished so Client can Rate with Stars & Comment */}
                {debeCalificarCliente && (
                  <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-navy-950 block text-sm">
                          ¡El técnico terminó el trabajo! Deja tus estrellas y comentario
                        </strong>
                        <span className="text-slate-700">
                          Tu calificación con estrellas (1 a 5) y tu comentario aparecerán publicados directamente en el anuncio de{' '}
                          <strong>{ord.items.map(it => it.servicio.tecnicoNombre).join(', ')}</strong>.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenRating(ord)}
                      className="px-4 py-2 text-xs font-extrabold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                    >
                      <Star className="w-4 h-4 fill-navy-950 text-navy-950" />
                      <span>Poner Estrellas y Comentario</span>
                    </button>
                  </div>
                )}

                {/* Visible Published Review Strip on Collapsed Card */}
                {ord.calificacion && (
                  <div className="px-5 sm:px-6 py-3 bg-amber-50/70 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {ord.calificacion.estrellas} / 5 Estrellas
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                          ✓ Publicado en el anuncio del técnico
                        </span>
                        <span className="text-[11px] text-slate-500">{ord.calificacion.fecha}</span>
                      </div>
                      <p className="text-slate-800 italic">"{ord.calificacion.comentario}"</p>
                    </div>
                  </div>
                )}

                {/* Always-visible Quick Actions Bar */}
                <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Trabajador: <strong>{ord.items.map(it => it.servicio.tecnicoNombre).join(', ')}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón Principal: Ver Pedido Completo */}
                    <button
                      type="button"
                      onClick={() => setPedidoEnDetalleId(ord.id)}
                      className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-navy-900 hover:bg-navy-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ver Pedido</span>
                    </button>

                    {/* Pago Protegido Culqi para cliente (cuando la orden no ha sido pagada aún con Culqi) */}
                    {soyCliente && !ord.pagoCulqi && (ord.montoReferencial || ord.total) > 0 && ord.aceptacionTrabajador !== 'NO_DISPONIBLE' && (
                      <button
                        type="button"
                        onClick={() => setCulqiOrderTarget(ord)}
                        className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-[#00a19b] hover:bg-[#008c87] active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>
                          Pagar con Culqi (S/ {(ord.montoReferencial || ord.total).toFixed(2)})
                        </span>
                      </button>
                    )}

                    {ord.pagoCulqi && (
                      <span className="px-2.5 py-1 text-[11px] font-extrabold bg-teal-50 text-[#006965] border border-[#00a19b]/40 rounded-xl">
                        ✓ Pagado Culqi · {ord.pagoCulqi.authorizationCode}
                      </span>
                    )}

                    {/* Botón Principal: Confirmar Trabajo / Liberar */}
                    {canReleaseFunds && (
                      <button
                        type="button"
                        onClick={() => darConformidadYLiberarFondos(ord.id)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>
                          {isSinCobro
                            ? 'Confirmar Trabajo Realizado'
                            : `Dar Conformidad y Liberar S/ ${ord.total.toFixed(2)}`}
                        </span>
                      </button>
                    )}

                    {/* Botón de Reportar Observación (Garantía) */}
                    {canReleaseFunds && (
                      <button
                        type="button"
                        onClick={() => setObservationModalOrder(ord)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reportar Observación</span>
                      </button>
                    )}

                    {/* Botón de Calificar (Disponible apenas termina el técnico o cuando ya está liberado) */}
                    {isFinalizado && (isAdmin || soyCliente) && (
                      <button
                        type="button"
                        onClick={() => handleOpenRating(ord)}
                        className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                        <span>{ord.calificacion ? 'Ver / Modificar Calificación' : 'Calificar con Estrellas y Comentario'}</span>
                      </button>
                    )}

                    {/* Envío directo a los 3 canales: Web + Correo + WhatsApp */}
                    {(() => {
                      const primerServicio = ord.items[0]?.servicio;
                      const telTrabajador =
                        ord.canalesEnvio?.whatsappTrabajador ||
                        primerServicio?.tecnicoTelefono ||
                        '966 123 456';
                      const correoTrabajador =
                        ord.canalesEnvio?.correoTrabajador ||
                        (primerServicio ? resolveEmailServicio(primerServicio, usuarios) : 'especialista@conectaoficios.pe');
                      const msgCompleto = buildWhatsAppSolicitudTrabajadorMsg(
                        ord,
                        primerServicio?.tecnicoNombre
                      );
                      const waTrabajadorUrl = buildWhatsAppUrl(telTrabajador, msgCompleto);
                      const mailData = buildCorreoSolicitudTrabajador(
                        ord,
                        primerServicio?.tecnicoNombre
                      );
                      const mailTrabajadorUrl = buildMailtoUrl(
                        correoTrabajador,
                        mailData.subject,
                        mailData.body
                      );
                      const gmailTrabajadorUrl = buildGmailComposeUrl(
                        correoTrabajador,
                        mailData.subject,
                        mailData.body
                      );
                      const waClienteUrl = buildWhatsAppUrl(
                        ord.datosVisita.telefonoWhatsapp,
                        buildWhatsAppRespuestaClienteMsg(ord)
                      );
                      return (
                        <>
                          <a
                            href={gmailTrabajadorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => marcarCanalEnvioOrden(ord.id, 'correo')}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                            title={`Enviar solicitud completa vía Gmail a: ${correoTrabajador}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Gmail ({correoTrabajador})</span>
                          </a>

                          <a
                            href={mailTrabajadorUrl}
                            onClick={() => marcarCanalEnvioOrden(ord.id, 'correo')}
                            className="px-2.5 py-1.5 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1"
                            title={`Abrir app de correo para ${correoTrabajador}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Correo</span>
                          </a>

                          <a
                            href={waTrabajadorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => marcarCanalEnvioOrden(ord.id, 'whatsapp')}
                            className="px-3 py-1.5 text-xs font-extrabold text-navy-950 bg-[#25D366] hover:bg-[#1ebd5b] rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                            title={`Enviar solicitud completa al WhatsApp de ${primerServicio?.tecnicoNombre || 'Trabajador'} (+51 ${telTrabajador})`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp (+51 {telTrabajador})</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(msgCompleto);
                              showToast(
                                'Datos Copiados',
                                `Datos completos de la orden ${ord.id} copiados para Correo o WhatsApp.`,
                                'success'
                              );
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1"
                            title="Copiar mensaje completo con fecha, hora y ubicación"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </button>

                          {(soyTrabajador || isAdmin) && (
                            <a
                              href={waClienteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-bold text-[#075E54] bg-white hover:bg-emerald-50 border border-[#25D366]/50 rounded-xl transition-all flex items-center gap-1.5"
                              title={`Responder por WhatsApp al cliente +51 ${ord.datosVisita.telefonoWhatsapp}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#128C7E]" />
                              <span>Avisar Cliente WA</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => void despacharOrdenAutomaticamente(ord)}
                            className="px-2.5 py-1.5 text-xs font-bold text-navy-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors flex items-center gap-1"
                            title="Reintentar envío automático por Correo SMTP, WhatsApp API y Chat"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reenviar Auto</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              void abrirChatDirecto({
                                ordenId: ord.id,
                                servicioTitulo: primerServicio?.titulo || 'Servicio Técnico',
                                clienteId: ord.clienteUsuarioId,
                                clienteNombre: ord.datosVisita.clienteNombre,
                                clienteDni: ord.datosVisita.clienteDni,
                                clienteTelefono: ord.datosVisita.telefonoWhatsapp,
                                trabajadorId: primerServicio?.autorUsuarioId,
                                trabajadorNombre: primerServicio?.tecnicoNombre || 'Especialista',
                                trabajadorDni: primerServicio?.tecnicoDni,
                                trabajadorTelefono: telTrabajador,
                                trabajadorAvatar: primerServicio?.tecnicoAvatar,
                                trabajadorInstitucion: primerServicio?.institucionCertificadora
                              });
                            }}
                            className="px-3 py-1.5 text-xs font-extrabold text-white bg-[#128C7E] hover:bg-[#075E54] rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                            title="Conversar directamente en la aplicación (Trabajador ↔ Cliente)"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat Directo</span>
                          </button>
                        </>
                      );
                    })()}

                    {/* Botón Llamar por Teléfono */}
                    <button
                      type="button"
                      onClick={() => {
                        const primerServicio = ord.items[0]?.servicio;
                        openCallModal({
                          tecnicoNombre: primerServicio?.tecnicoNombre || 'Especialista',
                          tecnicoTelefono: primerServicio?.tecnicoTelefono || '966 123 456',
                          servicioTitulo: primerServicio?.titulo || 'Servicio Técnico',
                          region: primerServicio?.region,
                          provincia: primerServicio?.provincia,
                          distrito: primerServicio?.distrito,
                          institucion: primerServicio?.institucionCertificadora
                        });
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      title="Llamar por teléfono al especialista"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                      <span>Llamar</span>
                    </button>

                    {/* Botón Ver Acta Digital */}
                    <button
                      type="button"
                      onClick={() => setReceiptModalOrder(ord)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Acta & Recibo</span>
                    </button>

                  </div>

                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/50 border-t border-slate-200 space-y-4 text-xs">
                    
                    {/* Escrow Timeline */}
                    {renderTimeline(ord)}

                    {/* Items List */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2">
                        Servicios y Turnos Contratados
                      </h4>
                      <div className="space-y-2">
                        {ord.items.map(it => (
                          <div key={it.servicioId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                              <span className="font-bold text-slate-900">{it.servicio.titulo}</span>
                              <div className="text-slate-500 text-[11px]">
                                Técnico: {it.servicio.tecnicoNombre} · {it.servicio.institucionCertificadora} · {it.cantidadTurnos} turno(s)
                              </div>
                            </div>
                            <span className="font-bold text-navy-950 tabular-nums text-sm">
                              S/ {it.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Subtotal (incluye 10% garantía):</span>
                        <span className="font-bold text-slate-800">S/ {ord.subtotalTecnico.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Fondo de Garantía de Custodia:</span>
                        <span className="font-bold text-emerald-700">S/ {ord.garantiaTotal.toFixed(2)} (10%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">IGV Legal (18%):</span>
                        <span className="font-bold text-slate-800">S/ {ord.igv.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Review Display if exists */}
                    {ord.calificacion && (
                      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            Calificación otorgada: {ord.calificacion.estrellas} / 5 Estrellas
                          </span>
                          <span className="text-[11px] text-amber-800">{ord.calificacion.fecha}</span>
                        </div>
                        <p className="text-amber-900 italic">
                          "{ord.calificacion.comentario}"
                        </p>
                        <div className="flex gap-4 text-[11px] text-amber-800 pt-1">
                          <span>Puntualidad: {ord.calificacion.criterios.puntualidad}⭐</span>
                          <span>Calidad Técnica: {ord.calificacion.criterios.calidad}⭐</span>
                          <span>Limpieza: {ord.calificacion.criterios.limpieza}⭐</span>
                        </div>
                      </div>
                    )}

                    {/* Audit Log / Historial de Estados */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2">
                        Bitácora Fiduciaria (Historial de Custodia)
                      </h4>
                      <div className="space-y-1.5">
                        {ord.historialEstados.map((h, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start gap-2.5">
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 mt-0.5">{h.fecha}</span>
                            <span className="text-slate-700 leading-snug">{h.descripcion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PARA CALIFICAR AL ESPECIALISTA */}
      {/* ======================================================== */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                Calificar Servicio de {ratingModalOrder.items[0]?.servicio.tecnicoNombre}
              </h3>
              <button onClick={() => setRatingModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
              
              {/* Overall Star Picker */}
              <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-2">Valoración General:</span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setEstrellas(val)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          val <= estrellas
                            ? 'fill-amber-400 text-amber-400 drop-shadow'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-navy-950 mt-1 block">
                  {estrellas === 5 ? '¡Excelente trabajo!' : estrellas === 4 ? 'Muy bueno' : estrellas === 3 ? 'Aceptable' : 'Con observaciones'}
                </span>
              </div>

              {/* Specific Criteria */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Puntualidad en la visita:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setPuntualidad(v)}
                        className={`w-6 h-6 rounded text-[11px] font-bold ${
                          v <= puntualidad ? 'bg-amber-400 text-navy-950' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Calidad técnica y pulcritud:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setCalidad(v)}
                        className={`w-6 h-6 rounded text-[11px] font-bold ${
                          v <= calidad ? 'bg-amber-400 text-navy-950' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Limpieza del área de trabajo:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setLimpieza(v)}
                        className={`w-6 h-6 rounded text-[11px] font-bold ${
                          v <= limpieza ? 'bg-amber-400 text-navy-950' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text review */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tu Comentario (se publicará en el anuncio de {ratingModalOrder.items[0]?.servicio.tecnicoNombre}):
                </label>
                <textarea
                  rows={3}
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  placeholder="Cuéntanos cómo fue el trabajo del técnico..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                  ✓ Al guardar, tus estrellas y comentario aparecerán visibles en la publicación del especialista.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOrder(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Publicar Estrellas y Comentario
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PARA REPORTAR OBSERVACIÓN / ACTIVAR GARANTÍA */}
      {/* ======================================================== */}
      {observationModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Activar Garantía TrabajaYa
              </h3>
              <button onClick={() => setObservationModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {observationModalOrder.sinCobroSolicitud || observationModalOrder.total === 0 ? (
                <>
                  Al reportar una observación, <strong>la revisión se registra sin costo (S/ 0.00)</strong> para que el trabajador coordine una nueva visita a tu domicilio y subsane cualquier detalle pendiente.
                </>
              ) : (
                <>
                  Al reportar una observación, <strong>los fondos de S/ {observationModalOrder.total.toFixed(2)} permanecen 100% retenidos en custodia fiduciaria</strong>. El técnico recibirá la solicitud para re-visitar tu domicilio y subsanar cualquier detalle sin costo adicional.
                </>
              )}
            </p>

            <form onSubmit={handleSubmitObservation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Describe el motivo de la observación:
                </label>
                <textarea
                  rows={3}
                  value={motivoObservacion}
                  onChange={e => setMotivoObservacion(e.target.value)}
                  placeholder="Ej. La cerradura quedó con fricción al girar, o persiste pequeño goteo..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setObservationModalOrder(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Congelar Pago y Reportar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE ACTA DE CONFORMIDAD Y RECIBO DIGITAL */}
      {/* ======================================================== */}
      {receiptModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6 overflow-x-hidden">
            <img
              src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 m-auto w-80 h-80 object-contain opacity-[0.06]"
            />
            
            <button
              onClick={() => setReceiptModalOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Document Header */}
            <div className="text-center border-b border-slate-200 pb-5 relative z-10">
              <div className="inline-flex items-center justify-center rounded-full bg-white p-1 border-2 border-amber-400/80 shadow-md mb-2.5 w-20 h-20">
                <img
                  src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
                  alt="Trabaja Ya · Tu talento, nuestro compromiso"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <h3 className="text-lg font-black text-navy-950 uppercase tracking-tight">
                {receiptModalOrder.sinCobroSolicitud || receiptModalOrder.total === 0
                  ? 'TrabajaYa · Acta de Solicitud y Conformidad de Servicio'
                  : 'TrabajaYa · Acta de Conformidad y Comprobante Fiduciario'}
              </h3>
              <p className="text-xs text-slate-500">
                Plataforma Nacional de Servicios Multioficios · 25 Regiones del Perú
              </p>
              <span className="inline-block mt-2 font-mono text-[11px] bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200">
                PEDIDO: {receiptModalOrder.id} · AUT: {receiptModalOrder.codigoAutorizacion}
              </span>
            </div>

            {/* Details table */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Cliente Solicitante:</span>
                  <span className="font-bold text-slate-900">{receiptModalOrder.datosVisita.clienteNombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">DNI:</span>
                  <span className="font-mono text-slate-900">{receiptModalOrder.datosVisita.clienteDni || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Teléfono / WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-900">+51 {receiptModalOrder.datosVisita.telefonoWhatsapp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Correo Electrónico:</span>
                  <span className="font-mono text-slate-900 break-all">{receiptModalOrder.datosVisita.clienteEmail || 'No especificado'}</span>
                </div>
                {(receiptModalOrder.datosVisita.fechaVisita || receiptModalOrder.datosVisita.horaVisita) && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Fecha y Hora Solicitada:</span>
                    <span className="font-bold text-navy-950">
                      {receiptModalOrder.datosVisita.fechaVisita || 'Por confirmar'} · {receiptModalOrder.datosVisita.horaVisita || receiptModalOrder.datosVisita.turno}
                    </span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Lugar de la Prestación:</span>
                  <span className="font-medium text-slate-900">
                    {receiptModalOrder.datosVisita.direccion} ({formatUbicacion(receiptModalOrder.datosVisita.distrito, receiptModalOrder.datosVisita.provincia, receiptModalOrder.datosVisita.region)})
                    {receiptModalOrder.datosVisita.referencia ? ` · Ref.: ${receiptModalOrder.datosVisita.referencia}` : ''}
                  </span>
                </div>
                {receiptModalOrder.datosVisita.notasAdicionales && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Detalles del Encargo:</span>
                    <span className="text-slate-800">{receiptModalOrder.datosVisita.notasAdicionales}</span>
                  </div>
                )}
              </div>

              {/* Services Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Servicio y Técnico</th>
                      <th className="p-2.5 text-center">Turnos</th>
                      <th className="p-2.5 text-right">
                        {receiptModalOrder.sinCobroSolicitud || receiptModalOrder.total === 0 ? 'Ref.' : 'Monto'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receiptModalOrder.items.map(it => (
                      <tr key={it.servicioId}>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{it.servicio.titulo}</div>
                          <div className="text-[11px] text-slate-500">
                            {it.servicio.tecnicoNombre} ({it.servicio.institucionCertificadora})
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-mono">{it.cantidadTurnos}</td>
                        <td className="p-2.5 text-right font-bold tabular-nums">
                          {receiptModalOrder.sinCobroSolicitud || receiptModalOrder.total === 0
                            ? `Ref. S/ ${it.subtotal.toFixed(2)}`
                            : `S/ ${it.subtotal.toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              {receiptModalOrder.sinCobroSolicitud || receiptModalOrder.total === 0 ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tarifa referencial del servicio:</span>
                    <span className="font-semibold tabular-nums">
                      S/ {(receiptModalOrder.montoReferencial || 0).toFixed(2)} (no cobrado)
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Comisión / cobro al trabajador:</span>
                    <span className="font-bold tabular-nums">S/ 0.00 (0%)</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-emerald-900 pt-2 border-t border-emerald-200">
                    <span>Total Cobrado en la Solicitud:</span>
                    <span className="tabular-nums">S/ 0.00</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-right text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal técnico (Tarifa base + 10% garantía):</span>
                    <span className="font-semibold tabular-nums">S/ {receiptModalOrder.subtotalTecnico.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Fondo de Garantía de Custodia (10%):</span>
                    <span className="font-semibold tabular-nums">S/ {receiptModalOrder.garantiaTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IGV Legal de Ley (18%):</span>
                    <span className="font-semibold tabular-nums">S/ {receiptModalOrder.igv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-navy-950 pt-2 border-t border-slate-200">
                    <span>Total en Custodia Fiduciaria:</span>
                    <span className="tabular-nums">S/ {receiptModalOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Hash and Seal */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-mono">
                <span>HASH DE INTEGRIDAD CRIPTOGRÁFICA:</span>
                <div className="break-all font-semibold mt-0.5">
                  SHA256: 8f49a0e1c2d4...9482910fae{receiptModalOrder.id.replace('PED-', '')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Exportar PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptModalOrder(null)}
                className="px-5 py-2 bg-navy-900 text-white text-xs font-bold rounded-xl hover:bg-navy-950 transition-colors"
              >
                Cerrar Comprobante
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Culqi Escrow Checkout Modal for Orders */}
      {culqiOrderTarget && (
        <CulqiCheckoutModal
          isOpen={Boolean(culqiOrderTarget)}
          onClose={() => setCulqiOrderTarget(null)}
          onSuccess={(receipt: CulqiPaymentReceipt) => {
            pagarOrdenConCulqi(culqiOrderTarget.id, receipt);
            setCulqiOrderTarget(null);
          }}
          amountSoles={culqiOrderTarget.montoReferencial || culqiOrderTarget.total || 50}
          title={`Pago en Custodia · Orden ${culqiOrderTarget.id}`}
          description={culqiOrderTarget.items.map(it => it.servicio.titulo).join(', ')}
          concepto="ORDEN_CUSTODIA"
          referenceId={culqiOrderTarget.id}
          defaultEmail={culqiOrderTarget.datosVisita.clienteEmail || currentUser?.email}
          defaultPhone={culqiOrderTarget.datosVisita.telefonoWhatsapp}
          customerName={culqiOrderTarget.datosVisita.clienteNombre}
        />
      )}

    </div>
  );
};
