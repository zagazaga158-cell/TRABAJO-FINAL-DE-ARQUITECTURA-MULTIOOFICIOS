import React from 'react';
import { useConecta } from '../context/ConectaContext';
import { formatUbicacion } from '../data/peruUbigeo';
import {
  buildOrdenMapsUrl,
  buildWhatsAppSolicitudTrabajadorMsg,
  buildWhatsAppUrl,
  buildCorreoSolicitudTrabajador,
  buildMailtoUrl,
  buildGmailComposeUrl,
  getTrabajadoresUnicosOrden
} from '../utils/whatsappSolicitud';
import {
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  ArrowRight,
  FileCheck,
  Copy,
  PhoneCall,
  ExternalLink,
  Send,
  Mail,
  Globe,
  Eye
} from 'lucide-react';

export const OrdenConfirmadaModal: React.FC = () => {
  const {
    lastCreatedOrder,
    setLastCreatedOrder,
    setPedidoEnDetalleId,
    marcarCanalEnvioOrden,
    setActiveTab,
    usuarios,
    showToast,
    abrirChatDirecto,
    despacharOrdenAutomaticamente,
    openCallModal
  } = useConecta();

  if (!lastCreatedOrder) return null;
  const ord = lastCreatedOrder;
  const isSinCobro = Boolean(ord.sinCobroSolicitud || ord.total === 0);

  const handleGoToOrders = () => {
    setLastCreatedOrder(null);
    setActiveTab('ordenes');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ord.id);
    showToast('Código Copiado', `Código ${ord.id} copiado al portapapeles.`, 'info');
  };

  const mapaUrl = buildOrdenMapsUrl(ord);
  const trabajadores = getTrabajadoresUnicosOrden(ord, usuarios);
  const primerTrabajador = trabajadores[0];
  const mensajeWhatsApp = buildWhatsAppSolicitudTrabajadorMsg(
    ord,
    primerTrabajador?.nombre
  );
  const correoData = buildCorreoSolicitudTrabajador(ord, primerTrabajador?.nombre);

  const handleCopyWhatsAppMsg = () => {
    navigator.clipboard.writeText(mensajeWhatsApp);
    showToast(
      'Mensaje WhatsApp Copiado',
      'Todos los datos de la solicitud fueron copiados para enviarse por WhatsApp.',
      'success'
    );
  };

  const handleCopyEmailMsg = () => {
    navigator.clipboard.writeText(`Asunto: ${correoData.subject}\n\n${correoData.body}`);
    showToast(
      'Correo Copiado',
      `Texto completo del correo para ${primerTrabajador?.email || 'el trabajador'} copiado.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-slate-200 relative text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top green success banner */}
        <div className="bg-emerald-600 text-white p-6 rounded-t-3xl text-center relative">
          <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
            {isSinCobro ? 'Despacho Automático (Web · Chat · Correo · WhatsApp) · S/ 0.00' : 'Orden Registrada'}
          </span>
          <h3 className="text-2xl font-black text-white">
            ¡Solicitud Enviada Automáticamente al Trabajador!
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-lg mx-auto">
            El servidor procesó el envío automático de tu pedido al <strong>Chat Directo en App</strong>, <strong>Web del Trabajador</strong>, <strong>Correo</strong> y <strong>WhatsApp</strong> sin cobros (<strong>S/ 0.00</strong>).
          </p>
        </div>

        {/* Modal content body */}
        <div className="p-6 space-y-5">
          {/* Key order indicators */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 block">Código Único de Orden:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold font-mono text-navy-950">{ord.id}</span>
                <button
                  onClick={handleCopyCode}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Copiar código"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Registro de Solicitud:</span>
              <span className="text-sm font-bold font-mono text-emerald-700 block mt-0.5">
                {ord.codigoAutorizacion}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isSinCobro ? 'Monto cobrado al enviar / al trabajador:' : 'Total de la Orden:'}
                </span>
                <span className="text-xl font-extrabold text-emerald-700 tabular-nums">
                  S/ {ord.total.toFixed(2)}
                </span>
                {ord.montoReferencial !== undefined && isSinCobro && (
                  <span className="text-[11px] text-slate-500 block">
                    Tarifa referencial del servicio: S/ {ord.montoReferencial.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-lg">
                ⏳ Pendiente Aceptación del Trabajador
              </span>
            </div>
          </div>

          {/* 3-Channel Dispatch Summary */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-navy-950">
                Envío Automático a los Canales del Trabajador
              </h4>
              <button
                type="button"
                onClick={() => void despacharOrdenAutomaticamente(ord)}
                className="px-2.5 py-1 bg-navy-900 hover:bg-navy-950 text-amber-300 text-[11px] font-bold rounded-lg flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Reintentar Envío Automático</span>
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-[11px] text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Despacho automático ejecutado:</strong> Tu pedido se entregó de inmediato en la web del trabajador y en el <strong>Chat Directo en Tiempo Real</strong>. El servidor también procesó el envío automático por Correo SMTP y WhatsApp API (si aún quieres enviarlo desde tu cuenta personal de Gmail o WhatsApp Web, tienes los accesos rápidos abajo).
              </span>
            </div>

            {/* Canal 1: Misma Página Web del Trabajador */}
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-sky-600 text-white rounded-xl shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sky-950">
                    1. Web y Chat Directo del Trabajador (Tiempo Real)
                  </h5>
                  <p className="text-sky-900 mt-0.5">
                    Ya aparece en <strong>Mi Perfil</strong>, <strong>Mis Órdenes</strong> y en el <strong>Chat Directo</strong> de{' '}
                    <strong>{trabajadores.map(t => t.nombre).join(', ')}</strong>.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px] shrink-0">
                ✓ Enviado Auto
              </span>
            </div>

            {/* Canal 2: Correo Electrónico del Trabajador */}
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-indigo-950 flex flex-wrap items-center gap-2">
                      <span>2. Correo Electrónico del Trabajador</span>
                      {ord.canalesEnvio?.correoEnviadoAuto ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                          ✓ Enviado automáticamente por servidor
                        </span>
                      ) : ord.canalesEnvio?.correoIniciado ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                          ✓ Abierto para envío
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px]">
                          ⏳ Despacho en cola automática
                        </span>
                      )}
                    </h5>
                    <p className="text-indigo-900 mt-0.5">
                      Destinatario:{' '}
                      <strong className="font-mono">
                        {trabajadores.map(t => t.email).join(', ')}
                      </strong>
                    </p>
                    {ord.canalesEnvio?.correoDetalleAuto && (
                      <p className="text-[11px] text-indigo-800/90 mt-0.5">
                        {ord.canalesEnvio.correoDetalleAuto}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmailMsg}
                  className="text-[11px] font-bold text-indigo-800 hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar Correo</span>
                </button>
              </div>

              <div className="space-y-2">
                {trabajadores.map(trab => {
                  const mail = buildCorreoSolicitudTrabajador(ord, trab.nombre);
                  const mailUrl = buildMailtoUrl(trab.email, mail.subject, mail.body);
                  const gmailUrl = buildGmailComposeUrl(trab.email, mail.subject, mail.body);
                  return (
                    <div key={`mail-${trab.email}`} className="flex flex-wrap gap-2">
                      <a
                        href={gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => marcarCanalEnvioOrden(ord.id, 'correo')}
                        className="flex-1 min-w-[200px] px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Enviar vía Gmail a {trab.email}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={mailUrl}
                        onClick={() => marcarCanalEnvioOrden(ord.id, 'correo')}
                        className="px-3.5 py-2.5 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>App de Correo</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canal 3: WhatsApp del Trabajador */}
            <div className="p-4 bg-[#eefcf2] border-2 border-[#25D366] rounded-2xl space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-[#25D366] text-navy-950 rounded-xl shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h5 className="font-extrabold text-emerald-950 flex flex-wrap items-center gap-2">
                    <span>3. WhatsApp del Trabajador + Chat Directo en App</span>
                    {ord.canalesEnvio?.whatsappEnviadoAuto ? (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]">
                        ✓ WhatsApp API enviado automático
                      </span>
                    ) : ord.canalesEnvio?.whatsappIniciado ? (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]">
                        ✓ WhatsApp abierto
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px]">
                        ✓ Entregado en Chat · API en cola
                      </span>
                    )}
                  </h5>
                  <p className="text-emerald-900 mt-0.5">
                    Incluye orden, servicio, fecha, hora exacta, dirección, mapa GPS, tu teléfono{' '}
                    <strong>+51 {ord.datosVisita.telefonoWhatsapp}</strong> y S/ 0.00 cobro.
                  </p>
                  {ord.canalesEnvio?.whatsappDetalleAuto && (
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      {ord.canalesEnvio.whatsappDetalleAuto}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Vista previa del mensaje completo:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppMsg}
                    className="text-[11px] font-bold text-navy-900 hover:text-emerald-700 inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar mensaje</span>
                  </button>
                </div>
                <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
                  {mensajeWhatsApp}
                </pre>
              </div>

              <div className="space-y-2">
                {trabajadores.map(trab => {
                  const msgTrab = buildWhatsAppSolicitudTrabajadorMsg(ord, trab.nombre);
                  const waUrl = buildWhatsAppUrl(trab.telefono, msgTrab);
                  return (
                    <a
                      key={`wa-${trab.nombre}-${trab.telefono}`}
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => marcarCanalEnvioOrden(ord.id, 'whatsapp')}
                      className="w-full px-4 py-3 bg-[#25D366] hover:bg-[#1ebd5b] text-navy-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        Enviar por WhatsApp a {trab.nombre} (+51 {trab.telefono})
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const primerServicio = ord.items[0]?.servicio;
                    setLastCreatedOrder(null);
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
                      trabajadorTelefono: primerServicio?.tecnicoTelefono || '966 123 456',
                      trabajadorAvatar: primerServicio?.tecnicoAvatar,
                      trabajadorInstitucion: primerServicio?.institucionCertificadora
                    });
                  }}
                  className="flex-1 px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 justify-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir Chat Directo (Trabajador ↔ Cliente)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const primerServicio = ord.items[0]?.servicio;
                    setLastCreatedOrder(null);
                    openCallModal({
                      tecnicoNombre: primerServicio?.tecnicoNombre || 'Especialista',
                      tecnicoTelefono: primerServicio?.tecnicoTelefono || '966 123 456',
                      servicioTitulo: primerServicio?.titulo || 'Servicio Técnico',
                      distrito: primerServicio?.distrito,
                      institucion: primerServicio?.institucionCertificadora
                    });
                  }}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 justify-center"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Llamar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details of Scheduled Visit */}
          <div className="space-y-2.5 text-xs text-slate-700 bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <FileCheck className="w-4 h-4 text-amber-600" />
              Resumen de Horario y Ubicación del Domicilio
            </h4>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Fecha:</strong> {ord.datosVisita.fechaVisita || ord.fecha} · <strong>Turno:</strong>{' '}
                {ord.datosVisita.turno}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Hora solicitada:</strong>{' '}
                <span className="font-mono font-bold text-navy-950">
                  {ord.datosVisita.horaVisita ? `${ord.datosVisita.horaVisita} hrs` : ord.datosVisita.turno}
                </span>
              </span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>
                  <strong>Domicilio:</strong> {ord.datosVisita.direccion} (
                  {formatUbicacion(
                    ord.datosVisita.distrito,
                    ord.datosVisita.provincia,
                    ord.datosVisita.region
                  )}
                  )
                </span>
                {ord.datosVisita.referencia && (
                  <span className="block text-[11px] text-slate-600">
                    Ref.: {ord.datosVisita.referencia}
                  </span>
                )}
                {mapaUrl && (
                  <a
                    href={mapaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 underline"
                  >
                    <span>Ver ubicación del domicilio en mapa</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const id = ord.id;
                setLastCreatedOrder(null);
                setPedidoEnDetalleId(id);
              }}
              className="w-full sm:w-auto py-3 px-4 bg-amber-400 hover:bg-amber-300 text-navy-950 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Pedido Completo</span>
            </button>
            <button
              type="button"
              onClick={handleGoToOrders}
              className="w-full flex-1 py-3 px-4 bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Ver Estado en "Mis Órdenes"</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLastCreatedOrder(null)}
              className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
