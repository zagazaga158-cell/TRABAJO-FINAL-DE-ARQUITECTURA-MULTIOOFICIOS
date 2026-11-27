import React, { useState, useEffect, useRef } from 'react';
import { useConecta } from '../context/ConectaContext';
import { ChatConversation } from '../types';
import {
  buildWhatsAppSolicitudTrabajadorMsg,
  buildWhatsAppUrl
} from '../utils/whatsappSolicitud';
import {
  X,
  Send,
  Phone,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  ArrowLeft,
  UserCheck,
  Wrench,
  Lock,
  UserPlus,
  LogIn
} from 'lucide-react';

export const WhatsAppChatModal: React.FC = () => {
  const {
    currentUser,
    currentRole,
    chatConversations,
    activeChatConversationId,
    setActiveChatConversationId,
    showChatInbox,
    setShowChatInbox,
    activeWhatsAppChat,
    setActiveWhatsAppChat,
    enviarMensajeChat,
    ordenes,
    openCallModal,
    setActiveTab,
    setShowAuthModal
  } = useConecta();

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOpen = Boolean(showChatInbox || activeWhatsAppChat);

  const activeConv: ChatConversation | undefined =
    chatConversations.find(c => c.id === activeChatConversationId) ||
    (activeWhatsAppChat
      ? chatConversations.find(
          c =>
            (activeWhatsAppChat.ordenId && c.ordenId === activeWhatsAppChat.ordenId) ||
            c.trabajadorTelefono.replace(/\D/g, '') ===
              activeWhatsAppChat.tecnicoTelefono.replace(/\D/g, '')
        )
      : undefined) ||
    chatConversations[0];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeConv?.id, activeConv?.messages.length]);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowChatInbox(false);
    setActiveWhatsAppChat(null);
  };

  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-navy-950 text-white p-6 text-center relative">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Registro Requerido para Chatear
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              TrabajaYa Perú · Identidad Verificada en Chat Directo
            </p>
          </div>

          <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950">
              Para hablar por <strong>Chat Directo</strong> con un trabajador o cliente y que aparezca tu <strong>nombre real</strong> (sin mostrar nombres de otras personas ni mensajes anónimos), debes registrarte o iniciar sesión.
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setShowAuthModal('register');
                  setActiveTab('acceso');
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrarme ahora</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setShowAuthModal('login');
                  setActiveTab('acceso');
                }}
                className="flex-1 py-3 px-4 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSafeClienteName = (conv?: ChatConversation): string => {
    if (!conv) return 'Anónimo (No registrado)';
    if (!conv.clienteId || conv.clienteId === 'GUEST') return 'Anónimo (No registrado)';
    return conv.clienteNombre || 'Usuario Registrado';
  };

  const isCurrentUserWorkerInConv = (conv?: ChatConversation): boolean => {
    if (!conv || !currentUser) return false;
    const cleanUserTel = (currentUser.telefonoWhatsapp || '').replace(/\D/g, '');
    const cleanWorkerTel = (conv.trabajadorTelefono || '').replace(/\D/g, '');
    return (
      conv.trabajadorId === currentUser.id ||
      (Boolean(currentUser.dni) && conv.trabajadorDni === currentUser.dni) ||
      (Boolean(cleanUserTel) && cleanUserTel === cleanWorkerTel)
    );
  };

  const isCurrentUserClientInConv = (conv?: ChatConversation): boolean => {
    if (!conv || !currentUser) return false;
    return (
      conv.clienteId === currentUser.id ||
      (Boolean(currentUser.dni) && conv.clienteDni === currentUser.dni)
    );
  };

  const amIWorker =
    isCurrentUserWorkerInConv(activeConv) && !isCurrentUserClientInConv(activeConv);

  const counterpartName = activeConv
    ? amIWorker
      ? getSafeClienteName(activeConv)
      : activeConv.trabajadorNombre
    : activeWhatsAppChat?.tecnicoNombre || 'Chat Directo';

  const counterpartPhone = activeConv
    ? amIWorker
      ? activeConv.clienteTelefono || ''
      : activeConv.trabajadorTelefono
    : activeWhatsAppChat?.tecnicoTelefono || '';

  const ordenAsociada = activeConv?.ordenId
    ? ordenes.find(o => o.id === activeConv.ordenId)
    : activeWhatsAppChat?.ordenId
    ? ordenes.find(o => o.id === activeWhatsAppChat.ordenId)
    : undefined;

  const externalMessage = ordenAsociada
    ? buildWhatsAppSolicitudTrabajadorMsg(
        ordenAsociada,
        activeConv?.trabajadorNombre || activeWhatsAppChat?.tecnicoNombre
      )
    : `Hola ${counterpartName}, te escribo desde el Chat Directo de TrabajaYa Perú sobre: ${
        activeConv?.servicioTitulo || activeWhatsAppChat?.servicioTitulo || 'Servicio técnico'
      }.`;

  const externalWaUrl = counterpartPhone
    ? buildWhatsAppUrl(counterpartPhone, externalMessage)
    : '';

  const handleSend = async (textToSend?: string) => {
    const clean = (textToSend ?? inputText).trim();
    if (!clean || !activeConv || sending) return;
    setSending(true);
    if (!textToSend) setInputText('');
    try {
      await enviarMensajeChat(activeConv.id, clean, amIWorker ? 'trabajador' : 'cliente');
    } finally {
      setSending(false);
    }
  };

  const quickChips = amIWorker
    ? [
        '✓ Recibí tu solicitud, confirmo asistencia en el horario acordado.',
        '📍 Estoy saliendo hacia tu domicilio con mis herramientas.',
        '📷 ¿Podrías enviarme detalles adicionales de la falla o punto de acceso?'
      ]
    : [
        '📍 Hola, te confirmo mi dirección y referencia exacta para la visita.',
        '📷 ¿Necesitas que te detalle o envíe fotos de la falla antes de venir?',
        '⏰ Te espero en el horario acordado en mi domicilio.'
      ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[640px] max-h-[92vh] flex overflow-hidden border border-slate-300 text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* LEFT SIDEBAR: CONVERSATIONS INBOX */}
        <aside
          className={`${
            activeConv && activeChatConversationId ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 flex-col border-r border-slate-200 bg-slate-50 shrink-0`}
        >
          <div className="bg-navy-950 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-extrabold text-sm leading-tight">
                  Chat Directo en App
                </h3>
                <p className="text-[11px] text-slate-300">
                  Trabajador ↔ Cliente en tiempo real
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="md:hidden p-1.5 hover:bg-white/10 rounded-full text-white"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
            {chatConversations.length === 0 ? (
              <div className="p-6 text-center space-y-2 text-xs text-slate-500">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">Aún no tienes chats activos</p>
                <p className="leading-relaxed">
                  Envía una solicitud de visita o haz clic en <strong>Chat Directo</strong> en cualquier publicación, imprevisto u orden para conversar directamente entre trabajador y cliente.
                </p>
              </div>
            ) : (
              chatConversations.map(conv => {
                const isSelected = activeConv?.id === conv.id;
                const workerView =
                  isCurrentUserWorkerInConv(conv) && !isCurrentUserClientInConv(conv);
                const otherName = workerView ? getSafeClienteName(conv) : conv.trabajadorNombre;
                const lastMsg = conv.messages[conv.messages.length - 1];

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveChatConversationId(conv.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50 border-l-4 border-emerald-600'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-navy-900 text-amber-300 flex items-center justify-center font-bold text-base shrink-0">
                      {workerView ? '👤' : conv.trabajadorAvatar || '👨‍🔧'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-navy-950 truncate">
                          {otherName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {lastMsg?.timestamp || ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            workerView
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {workerView ? 'Cliente' : 'Trabajador'}
                        </span>
                        {conv.ordenId && (
                          <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 rounded font-bold">
                            {conv.ordenId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                        {conv.servicioTitulo}
                      </p>
                      {lastMsg && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg.text}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANE: ACTIVE CONVERSATION */}
        <section
          className={`${
            activeConv || !chatConversations.length ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col min-w-0 bg-white`}
        >
          {/* Conversation Header */}
          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeConv && (
                <button
                  type="button"
                  onClick={() => setActiveChatConversationId(null)}
                  className="md:hidden p-1.5 hover:bg-white/15 rounded-full text-white shrink-0"
                  title="Ver lista de chats"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              <div className="w-10 h-10 rounded-full bg-[#128c7e] text-white flex items-center justify-center text-lg font-bold border border-white/25 shrink-0">
                {amIWorker ? '👤' : activeConv?.trabajadorAvatar || activeWhatsAppChat?.avatar || '👨‍🔧'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white truncate">
                    {counterpartName}
                  </h4>
                  <span className="text-[10px] bg-amber-400 text-navy-950 font-extrabold px-1.5 py-0.5 rounded shrink-0">
                    {amIWorker
                      ? 'Cliente'
                      : activeConv?.trabajadorInstitucion || 'Oficio Verificado'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 truncate">
                  {counterpartPhone ? `+51 ${counterpartPhone}` : 'Conexión en tiempo real'} ·{' '}
                  {currentRole === 'ADMIN'
                    ? 'Supervisión Admin'
                    : amIWorker
                    ? 'Respondiendo como Trabajador'
                    : 'Respondiendo como Cliente'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {counterpartPhone && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openCallModal({
                      tecnicoNombre: counterpartName,
                      tecnicoTelefono: counterpartPhone,
                      servicioTitulo: activeConv?.servicioTitulo || 'Servicio TrabajaYa',
                      institucion: activeConv?.trabajadorInstitucion
                    });
                  }}
                  className="p-2 hover:bg-white/15 rounded-full transition-colors text-emerald-100 hover:text-white"
                  title="Llamar por teléfono"
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}

              {externalWaUrl && (
                <a
                  href={externalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-white/20 rounded-full transition-colors flex items-center gap-1 text-[11px] bg-white/15 px-2.5 py-1 text-emerald-50 hover:text-white font-semibold"
                  title="Abrir también en WhatsApp Web / Celular"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Service Sub-bar */}
          {activeConv && (
            <div className="bg-[#128c7e] text-emerald-50 px-4 py-1.5 text-xs flex items-center justify-between gap-2 border-t border-emerald-600/40 shrink-0">
              <span className="truncate flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <strong>Servicio:</strong> {activeConv.servicioTitulo}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {activeConv.ordenId && (
                  <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                    {activeConv.ordenId}
                  </span>
                )}
                {activeConv.imprevistoId && (
                  <span className="font-mono text-[10px] bg-amber-400 text-navy-950 px-1.5 py-0.5 rounded font-bold">
                    {activeConv.imprevistoId}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]"
            style={{
              backgroundImage: 'radial-gradient(#d4ccc3 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          >
            {!activeConv ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                <div className="bg-white/90 p-6 rounded-2xl border border-slate-200 max-w-sm space-y-2 shadow-sm">
                  <UserCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-extrabold text-sm text-navy-950">
                    Chat Directo Trabajador ↔ Cliente
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Selecciona una conversación a la izquierda o abre el chat desde cualquier técnico, orden o imprevisto para coordinar directamente sin intermediarios.
                  </p>
                </div>
              </div>
            ) : (
              activeConv.messages.map(msg => {
                const role = msg.senderRole || msg.sender;
                if (role === 'sistema' || msg.isStatusUpdate) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block bg-[#e1f3fb] text-[#1c4b63] text-[11px] px-3 py-1.5 rounded-lg shadow-2xs border border-[#cfe6f2] max-w-md leading-relaxed">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isWorkerMsg = role === 'trabajador' || role === 'tecnico';
                const isMine = amIWorker ? isWorkerMsg : !isWorkerMsg;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl shadow-xs text-xs relative ${
                        isMine
                          ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase ${
                            isWorkerMsg ? 'text-emerald-800' : 'text-sky-800'
                          }`}
                        >
                          {msg.senderId === 'GUEST' || msg.senderId === 'anon'
                            ? 'Anónimo (No registrado)'
                            : msg.senderName ||
                              (isWorkerMsg
                                ? activeConv.trabajadorNombre
                                : getSafeClienteName(activeConv))}{' '}
                          · {isWorkerMsg ? 'Trabajador' : 'Cliente'}
                        </span>
                      </div>

                      <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>

                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {isMine && <CheckCheck className="w-3.5 h-3.5 text-sky-500" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {activeConv && (
            <div className="bg-[#f0f2f5] px-3 py-2 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void handleSend(chip)}
                  className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 shadow-2xs whitespace-nowrap shrink-0 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Bar */}
          {activeConv && (
            <form
              onSubmit={e => {
                e.preventDefault();
                void handleSend();
              }}
              className="bg-[#f0f2f5] p-2.5 sm:px-4 flex items-center gap-2 shrink-0 border-t border-slate-200"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={
                  amIWorker
                    ? `Responder directamente a ${getSafeClienteName(activeConv)}...`
                    : `Escribir mensaje directo a ${activeConv.trabajadorNombre}...`
                }
                className="flex-1 bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#128c7e]"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="w-9 h-9 rounded-full bg-[#128c7e] hover:bg-[#075e54] text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-40 shrink-0"
                title="Enviar mensaje en tiempo real"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
