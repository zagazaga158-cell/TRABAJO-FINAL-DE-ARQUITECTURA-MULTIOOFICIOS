import React, { useState } from 'react';
import { useConecta } from '../context/ConectaContext';
import { formatUbicacion } from '../data/peruUbigeo';
import {
  buildOrdenMapsUrl,
  buildWhatsAppSolicitudTrabajadorMsg,
  buildWhatsAppRespuestaClienteMsg,
  buildWhatsAppUrl,
  buildCorreoSolicitudTrabajador,
  buildMailtoUrl,
  buildGmailComposeUrl,
  getTrabajadoresUnicosOrden
} from '../utils/whatsappSolicitud';
import {
  X,
  User,
  PhoneCall,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lock,
  ShieldCheck,
  Copy,
  Send,
  Globe,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const PedidoDetalleModal: React.FC = () => {
  const {
    pedidoEnDetalleId,
    setPedidoEnDetalleId,
    ordenes,
    usuarios,
    currentUser,
    responderDisponibilidadOrden,
    actualizarEstadoOrdenManual,
    marcarCanalEnvioOrden,
    abrirChatDirecto,
    despacharOrdenAutomaticamente,
    openCallModal,
    showToast
  } = useConecta();

  const [notaDecision, setNotaDecision] = useState('');

  if (!pedidoEnDetalleId) return null;
  const ord = ordenes.find(o => o.id === pedidoEnDetalleId);
  if (!ord) return null;

  const isSinCobro = Boolean(ord.sinCobroSolicitud || ord.total === 0);
  const estadoAceptacion = ord.aceptacionTrabajador || 'PENDIENTE';
  const isLiberado = ord.estado === 'CONFORMIDAD_Y_LIBERADO';

  const soyTrabajador = Boolean(
    currentUser &&
      ord.items.some(
        it =>
          it.servicio.autorUsuarioId === currentUser.id ||
          (Boolean(currentUser.dni) && it.servicio.tecnicoDni === currentUser.dni)
      )
  );

  const trabajadores = getTrabajadoresUnicosOrden(ord, usuarios);
  const primerTrabajador = trabajadores[0];
  const mapaUrl = buildOrdenMapsUrl(ord);
  const mensajeWaTrabajador = buildWhatsAppSolicitudTrabajadorMsg(ord, primerTrabajador?.nombre);
  const correoTrabajador = buildCorreoSolicitudTrabajador(ord, primerTrabajador?.nombre);
  const waClienteUrl = buildWhatsAppUrl(
    ord.datosVisita.telefonoWhatsapp,
    buildWhatsAppRespuestaClienteMsg(ord)
  );
  const resumenCompletoTexto = `Asunto: ${correoTrabajador.subject}\n\n${correoTrabajador.body}`;

  const handleCopyAll = () => {
    navigator.clipboard.writeText(resumenCompletoTexto);
    showToast(
      'Datos del Pedido Copiados',
      `Todos los datos del solicitante y ubicación del pedido ${ord.id} fueron copiados.`,
      'success'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setPedidoEnDetalleId(null)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[94vh] overflow-y-auto border border-slate-200 relative text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Navy Header */}
        <div className="bg-gradient-to-br from-navy-950 via-[#0d3b66] to-slate-900 text-white p-5 sm:p-6 rounded-t-3xl relative">
          <button
            type="button"
            onClick={() => setPedidoEnDetalleId(null)}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar detalle del pedido"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2 pr-8">
            <span className="px-2.5 py-0.5 bg-amber-400 text-navy-950 font-mono font-extrabold text-xs rounded-lg">
              {ord.id}
            </span>
            <span className="px-2.5 py-0.5 bg-white/15 text-slate-100 font-mono text-[11px] rounded-lg">
              {ord.codigoAutorizacion}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 font-bold text-[11px] rounded-lg">
              Cobro en solicitud: S/ {ord.total.toFixed(2)}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            Detalle Completo del Pedido y Datos del Solicitante
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Recibido el {ord.fecha} · Especialista asignado:{' '}
            <strong className="text-amber-300">
              {trabajadores.map(t => t.nombre).join(', ')}
            </strong>
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Acceptance Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${
              estadoAceptacion === 'ACEPTADA'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : estadoAceptacion === 'NO_DISPONIBLE'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2 font-extrabold">
              {estadoAceptacion === 'ACEPTADA' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : estadoAceptacion === 'NO_DISPONIBLE' ? (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>
                {estadoAceptacion === 'ACEPTADA'
                  ? `Pedido ACEPTADO por el trabajador (${ord.fechaRespuestaTrabajador || 'confirmado'})`
                  : estadoAceptacion === 'NO_DISPONIBLE'
                  ? `Pedido RECHAZADO / No disponible (${ord.fechaRespuestaTrabajador || ''})`
                  : 'Pendiente de aceptación o rechazo por la persona del oficio'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-navy-950 font-bold rounded-xl inline-flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Todo</span>
            </button>
          </div>

          {/* 1. ALL REQUESTER DATA */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
            <h4 className="text-sm font-black text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-amber-600" />
              <span>Todos los Datos de la Persona Solicitante</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Nombre Completo del Solicitante
                </span>
                <span className="text-sm font-extrabold text-navy-950 mt-0.5 block">
                  {ord.datosVisita.clienteNombre}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  DNI / Documento de Identidad
                </span>
                <span className="text-sm font-mono font-bold text-navy-950 mt-0.5 block">
                  {ord.datosVisita.clienteDni || 'No especificado'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Teléfono / WhatsApp del Solicitante
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-0.5">
                  <span className="text-sm font-mono font-extrabold text-emerald-800">
                    +51 {ord.datosVisita.telefonoWhatsapp}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPedidoEnDetalleId(null);
                        void abrirChatDirecto({
                          ordenId: ord.id,
                          servicioTitulo: ord.items[0]?.servicio.titulo || `Pedido ${ord.id}`,
                          clienteId: ord.clienteUsuarioId,
                          clienteNombre: ord.datosVisita.clienteNombre,
                          clienteDni: ord.datosVisita.clienteDni,
                          clienteTelefono: ord.datosVisita.telefonoWhatsapp,
                          trabajadorId: ord.items[0]?.servicio.autorUsuarioId,
                          trabajadorNombre: primerTrabajador?.nombre || 'Especialista',
                          trabajadorDni: ord.items[0]?.servicio.tecnicoDni,
                          trabajadorTelefono: primerTrabajador?.telefono || '',
                          trabajadorAvatar: primerTrabajador?.avatar,
                          trabajadorInstitucion: primerTrabajador?.institucion
                        });
                      }}
                      className="px-2.5 py-1 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat Directo</span>
                    </button>
                    <a
                      href={waClienteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-[#25D366] hover:bg-[#1ebd5b] text-navy-950 font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        openCallModal({
                          tecnicoNombre: ord.datosVisita.clienteNombre,
                          tecnicoTelefono: ord.datosVisita.telefonoWhatsapp,
                          servicioTitulo: `Pedido ${ord.id}`,
                          region: ord.datosVisita.region,
                          provincia: ord.datosVisita.provincia,
                          distrito: ord.datosVisita.distrito
                        })
                      }
                      className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Llamar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Correo Electrónico del Solicitante
                </span>
                <span className="text-sm font-mono font-bold text-indigo-900 mt-0.5 block break-all">
                  {ord.datosVisita.clienteEmail || 'No proporcionado'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. SCHEDULE & EXACT DOMICILE LOCATION */}
          <div className="bg-amber-50/70 rounded-2xl p-4 sm:p-5 border border-amber-200 space-y-3">
            <h4 className="text-sm font-black text-navy-950 flex items-center gap-2 border-b border-amber-200 pb-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Fecha, Hora y Ubicación Exacta del Domicilio</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">
                  Fecha Solicitada
                </span>
                <span className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  {ord.datosVisita.fechaVisita || ord.fecha}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">
                  Hora Solicitada y Turno
                </span>
                <span className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {ord.datosVisita.horaVisita
                    ? `${ord.datosVisita.horaVisita} hrs (${ord.datosVisita.turno})`
                    : ord.datosVisita.turno}
                </span>
              </div>

              <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Dirección del Domicilio
                    </span>
                    <span className="text-sm font-extrabold text-navy-950 block">
                      {ord.datosVisita.direccion}
                    </span>
                    <span className="text-xs text-slate-700 font-semibold block">
                      {formatUbicacion(
                        ord.datosVisita.distrito,
                        ord.datosVisita.provincia,
                        ord.datosVisita.region
                      )}
                      , Perú
                    </span>
                  </div>

                  <a
                    href={mapaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-slate-600">
                  <strong>Referencia:</strong> {ord.datosVisita.referencia || 'Sin referencia adicional'}
                </p>
                {ord.datosVisita.coordenadas && (
                  <p className="text-[11px] font-mono text-emerald-700">
                    Coordenadas GPS: {ord.datosVisita.coordenadas.lat}, {ord.datosVisita.coordenadas.lng}
                  </p>
                )}
              </div>

              {ord.datosVisita.notasAdicionales && (
                <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Detalles / Descripción del Encargo
                  </span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">
                    {ord.datosVisita.notasAdicionales}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. REQUESTED SERVICES & ZERO CHARGE */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <h4 className="text-sm font-black text-navy-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Servicio(s) Solicitado(s)</span>
            </h4>
            {ord.items.map(it => (
              <div
                key={it.servicioId}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <span className="font-extrabold text-navy-950 block">{it.servicio.titulo}</span>
                  <span className="text-[11px] text-slate-600">
                    {it.servicio.oficioLabel} · Especialista: {it.servicio.tecnicoNombre} ·{' '}
                    {it.cantidadTurnos} turno(s)
                  </span>
                </div>
                <div className="text-right">
                  {isSinCobro ? (
                    <>
                      <span className="font-extrabold text-emerald-700 block">
                        S/ 0.00 cobro
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Ref. S/ {it.subtotal.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-extrabold text-navy-950">
                      S/ {it.subtotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 4. STRICT DECISION PANEL: ONLY ASSIGNED TRADESPERSON CAN ACCEPT OR REJECT */}
          {!isLiberado && (
            <div className="rounded-2xl p-4 sm:p-5 border-2 border-navy-900/20 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-navy-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Decisión sobre el Pedido (Aceptar o Rechazar)</span>
                </h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-900 text-amber-300">
                  Exclusivo Persona del Oficio
                </span>
              </div>

              {soyTrabajador ? (
                <div className="space-y-3">
                  <p className="text-slate-700">
                    Como especialista asignado a este servicio, revisaste los datos completos del solicitante y la ubicación. Decide si aceptas o rechazas este pedido:
                  </p>
                  <input
                    type="text"
                    value={notaDecision}
                    onChange={e => setNotaDecision(e.target.value)}
                    placeholder="Nota opcional para el solicitante (ej. Confirmo puntualidad / No puedo en esa hora)..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const res = responderDisponibilidadOrden(ord.id, 'ACEPTADA', notaDecision);
                        if (res.ok) setNotaDecision('');
                      }}
                      className="flex-1 min-w-[180px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Aceptar Pedido</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const res = responderDisponibilidadOrden(
                          ord.id,
                          'NO_DISPONIBLE',
                          notaDecision || 'Pedido rechazado / No disponible en ese horario'
                        );
                        if (res.ok) setNotaDecision('');
                      }}
                      className="flex-1 min-w-[180px] px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Rechazar Pedido</span>
                    </button>
                  </div>

                  {estadoAceptacion === 'ACEPTADA' &&
                    (ord.estado === 'EN_CUSTODIA' ||
                      ord.estado === 'EN_CAMINO' ||
                      ord.estado === 'EN_EJECUCION') && (
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-600">
                          ¿Ya terminaste el servicio en el domicilio? Márcalo como finalizado para que el cliente te califique:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            actualizarEstadoOrdenManual(ord.id, 'COMPLETADO_PENDIENTE_CONFORMIDAD')
                          }
                          className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-amber-300 font-extrabold rounded-xl shadow-sm inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Marcar: Trabajo Terminado</span>
                        </button>
                      </div>
                    )}

                  {ord.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD' && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold">
                      ✓ Trabajo marcado como terminado. Ya aparece en Mis Órdenes del cliente para que coloque sus estrellas y comentario.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 text-slate-700">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy-950 block">
                      Solo la persona del oficio asignada puede aceptar o rechazar este pedido.
                    </strong>
                    <span>
                      Especialista autorizado para decidir:{' '}
                      <strong>{trabajadores.map(t => t.nombre).join(', ')}</strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. 3-CHANNEL AUTOMATIC DISPATCH TO WORKER */}
          {primerTrabajador && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Envío Automático (Web · Chat Directo · Correo · WhatsApp)
                </span>
                <button
                  type="button"
                  onClick={() => void despacharOrdenAutomaticamente(ord)}
                  className="px-2.5 py-1 bg-navy-900 hover:bg-navy-950 text-amber-300 font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Reenviar Automático</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPedidoEnDetalleId(null);
                    void abrirChatDirecto({
                      ordenId: ord.id,
                      servicioTitulo: primerTrabajador.titulo,
                      clienteId: ord.clienteUsuarioId,
                      clienteNombre: ord.datosVisita.clienteNombre,
                      clienteDni: ord.datosVisita.clienteDni,
                      clienteTelefono: ord.datosVisita.telefonoWhatsapp,
                      trabajadorId: ord.items[0]?.servicio.autorUsuarioId,
                      trabajadorNombre: primerTrabajador.nombre,
                      trabajadorDni: ord.items[0]?.servicio.tecnicoDni,
                      trabajadorTelefono: primerTrabajador.telefono,
                      trabajadorAvatar: primerTrabajador.avatar,
                      trabajadorInstitucion: primerTrabajador.institucion
                    });
                  }}
                  className="px-3.5 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold rounded-xl inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Directo (Trabajador ↔ Cliente)</span>
                </button>

                <a
                  href={buildWhatsAppUrl(primerTrabajador.telefono, mensajeWaTrabajador)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => marcarCanalEnvioOrden(ord.id, 'whatsapp')}
                  className="px-3.5 py-2 bg-[#25D366] hover:bg-[#1ebd5b] text-navy-950 font-extrabold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Web (+51 {primerTrabajador.telefono})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={buildGmailComposeUrl(
                    primerTrabajador.email,
                    correoTrabajador.subject,
                    correoTrabajador.body
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => marcarCanalEnvioOrden(ord.id, 'correo')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail ({primerTrabajador.email})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={buildMailtoUrl(
                    primerTrabajador.email,
                    correoTrabajador.subject,
                    correoTrabajador.body
                  )}
                  onClick={() => marcarCanalEnvioOrden(ord.id, 'correo')}
                  className="px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-300 font-bold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>App de Correo</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
