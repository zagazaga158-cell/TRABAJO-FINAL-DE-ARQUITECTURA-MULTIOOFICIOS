import React from 'react';
import { useConecta } from '../context/ConectaContext';
import { ResenaPublicacion } from '../types';
import { formatUbicacion } from '../data/peruUbigeo';
import {
  X,
  ShieldCheck,
  Award,
  Star,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  MessageSquare,
  PhoneCall,
  Camera,
  ArrowRight
} from 'lucide-react';

export const ServiceDetailModal: React.FC = () => {
  const {
    selectedServiceForModal,
    setSelectedServiceForModal,
    ordenes,
    usuarios,
    currentRole,
    agregarAlCarrito,
    setActiveTab,
    verPerfilPublico,
    abrirChatDirecto,
    openCallModal
  } = useConecta();

  if (!selectedServiceForModal) return null;
  const srv = selectedServiceForModal;

  const techAccount = usuarios.find(
    u => u.id === srv.autorUsuarioId || u.dni === srv.tecnicoDni
  );
  const isPro = srv.nivelPlan === 'PRO' || Boolean(srv.selloVerificadoPro);
  const isDocsVerified =
    isPro || techAccount?.estadoVerificacionMedia === 'VERIFICADO' || srv.capacitado;

  const opinionesMap = new Map<string, ResenaPublicacion>();
  (srv.resenasPublicadas || []).forEach(r => {
    opinionesMap.set(r.ordenId, r);
  });
  ordenes.forEach(o => {
    if (
      o.calificacion &&
      o.items.some(
        it =>
          it.servicioId === srv.id ||
          (Boolean(srv.autorUsuarioId) &&
            it.servicio.autorUsuarioId === srv.autorUsuarioId &&
            it.servicio.oficio === srv.oficio) ||
          (Boolean(srv.tecnicoDni) && it.servicio.tecnicoDni === srv.tecnicoDni)
      ) &&
      !opinionesMap.has(o.id)
    ) {
      opinionesMap.set(o.id, {
        ordenId: o.id,
        autorNombre: o.datosVisita.clienteNombre,
        estrellas: o.calificacion.estrellas,
        comentario: o.calificacion.comentario,
        fecha: o.calificacion.fecha,
        criterios: o.calificacion.criterios
      });
    }
  });
  const opinionesClientes = Array.from(opinionesMap.values());

  const handleContratar = () => {
    agregarAlCarrito(srv);
    setSelectedServiceForModal(null);
    setActiveTab('solicitud');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSelectedServiceForModal(null)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 relative text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="bg-navy-950 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={() => setSelectedServiceForModal(null)}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
            <span>{srv.oficioLabel}</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Publicación Admitida y Verificada
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
            {srv.titulo}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> {formatUbicacion(srv.distrito, srv.provincia, srv.region)}, Perú
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {srv.calificacion} ({srv.numResenas} opiniones)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {srv.experienciaAnos} años de trayectoria
            </span>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6">

          {/* Technician Profile Card */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center text-3xl font-bold shadow-md shrink-0">
              {srv.tecnicoAvatar}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  {srv.tecnicoNombre}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  {isPro && (
                    <span className="px-2 py-0.5 text-[11px] font-extrabold bg-navy-900 text-amber-300 rounded-md">
                      👑 Especialista PRO
                    </span>
                  )}
                  {isDocsVerified && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Documentos Verificados · DNI {srv.tecnicoDni}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Teléfono directo: <strong className="font-mono text-navy-950">+51 {srv.tecnicoTelefono}</strong> · Cobertura en {formatUbicacion(srv.distrito, srv.provincia, srv.region)}.
              </p>

              {/* Certification stamp */}
              <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="leading-tight">
                  <span className="font-bold text-amber-900">Acreditación: </span>
                  <span className="text-amber-800">{srv.institucionCertificadora} · Registro {srv.codigoCertificado}</span>
                </div>
              </div>

              {/* Specialist Trust & Compliance Summary */}
              {techAccount && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                  {(techAccount.antecedentesPolicialesNombre || techAccount.antecedentesPolicialesUrl) &&
                    (techAccount.antecedentesPenalesNombre || techAccount.antecedentesPenalesUrl) &&
                    (techAccount.antecedentesJudicialesNombre || techAccount.antecedentesJudicialesUrl) && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-md font-bold">
                        ✓ Antecedentes Policiales, Penales y Judiciales
                      </span>
                    )}
                  {techAccount.rucNumero && (
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-900 border border-sky-200 rounded-md font-bold">
                      ✓ RUC {techAccount.rucNumero} ({techAccount.tipoComprobanteTributario === 'FACTURA' ? 'Factura' : 'Recibo por Honorarios'})
                    </span>
                  )}
                  {(techAccount.comprobanteDomicilioNombre || techAccount.comprobanteDomicilioUrl) && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded-md font-semibold">
                      ✓ Domicilio Verificado
                    </span>
                  )}
                  {techAccount.contratoFirmado && techAccount.normasConductaFirmadas && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-md font-semibold">
                      ✓ Contrato y Normas de Conducta Firmadas
                    </span>
                  )}
                </div>
              )}

              {/* Mini preview of Completed Works + CTA to Public Profile */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                {techAccount?.fotosTrabajos && techAccount.fotosTrabajos.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {techAccount.fotosTrabajos.slice(0, 3).map(foto => (
                      <img
                        key={foto.id}
                        src={foto.imagenUrl}
                        alt={foto.titulo}
                        title={foto.titulo}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-300"
                      />
                    ))}
                    <span className="text-[11px] font-bold text-slate-600 ml-1 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      {techAccount.fotosTrabajos.length} trabajo(s)
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Perfil verificado de especialista
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedServiceForModal(null);
                    verPerfilPublico({
                      userId: srv.autorUsuarioId || techAccount?.id,
                      dni: srv.tecnicoDni,
                      nombre: srv.tecnicoNombre
                    });
                  }}
                  className="px-3 py-1.5 bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ver Perfil y Fotos de Trabajos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Alcance de la Visita Técnica
            </h5>
            <p className="text-sm text-slate-700 leading-relaxed">
              {srv.descripcion}
            </p>
          </div>

          {/* Technical Skills */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Habilidades y Competencias Certificadas
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {srv.habilidades.map((hab, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-slate-100 p-2 rounded-lg text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{hab}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confianza: Calificaciones y Opiniones Reales de Clientes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Calificaciones y Opiniones de Clientes
              </h5>
              <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {srv.calificacion.toFixed(1)} ({srv.numResenas} reseñas)
              </span>
            </div>

            {opinionesClientes.length > 0 ? (
              <div className="space-y-2">
                {opinionesClientes.map(res => (
                  <div key={res.ordenId} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {res.autorNombre} · <span className="text-[10px] text-emerald-700">✓ Servicio Verificado</span>
                      </span>
                      <span className="font-bold text-amber-600 flex items-center gap-0.5">
                        {'★'.repeat(res.estrellas)}
                      </span>
                    </div>
                    <p className="text-slate-700 italic">"{res.comentario}"</p>
                    <div className="text-[10px] text-slate-500 flex flex-wrap gap-3">
                      {res.criterios && (
                        <>
                          <span>Puntualidad: {res.criterios.puntualidad}/5</span>
                          <span>Calidad: {res.criterios.calidad}/5</span>
                          <span>Limpieza: {res.criterios.limpieza}/5</span>
                        </>
                      )}
                      <span>· {res.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Calificación promedio histórica: <strong>{srv.calificacion.toFixed(1)} ★</strong> basada en <strong>{srv.numResenas}</strong> trabajos verificados en todo el Perú.
              </div>
            )}
          </div>

          {/* Escrow Guarantee Box */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Garantía y Pago en Custodia TrabajaYa
              </h5>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Tus fondos de <strong>S/ {srv.tarifaCliente.toFixed(2)}</strong> quedan en custodia fiduciaria bancaria. El especialista no recibe la transferencia hasta que tú verifiques que la instalación o reparación quedó en óptimas condiciones.
              </p>
            </div>
          </div>

          {/* Tariff Breakdown & Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 block">Tarifa transparente al cliente:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-navy-950">
                  S/ {srv.tarifaCliente.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">
                  (Base S/ {srv.precioBase.toFixed(2)} + 10% fondo de custodia)
                </span>
              </div>
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" /> {srv.turnosLibres} turnos libres esta semana
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedServiceForModal(null);
                  void abrirChatDirecto({
                    servicioTitulo: srv.titulo,
                    trabajadorId: srv.autorUsuarioId || techAccount?.id,
                    trabajadorNombre: srv.tecnicoNombre,
                    trabajadorDni: srv.tecnicoDni,
                    trabajadorTelefono: srv.tecnicoTelefono,
                    trabajadorAvatar: srv.tecnicoAvatar,
                    trabajadorInstitucion: srv.institucionCertificadora
                  });
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-[#128C7E]" />
                <span>Chat Directo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedServiceForModal(null);
                  openCallModal({
                    tecnicoNombre: srv.tecnicoNombre,
                    tecnicoTelefono: srv.tecnicoTelefono,
                    servicioTitulo: srv.titulo,
                    region: srv.region,
                    provincia: srv.provincia,
                    distrito: srv.distrito,
                    institucion: srv.institucionCertificadora
                  });
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 text-sky-600" />
                <span>Llamar</span>
              </button>

              <button
                type="button"
                disabled={srv.turnosLibres === 0}
                onClick={handleContratar}
                className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md ${
                  srv.turnosLibres === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                }`}
              >
                {srv.turnosLibres === 0 ? 'Sin turnos' : 'Solicitar Visita'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

