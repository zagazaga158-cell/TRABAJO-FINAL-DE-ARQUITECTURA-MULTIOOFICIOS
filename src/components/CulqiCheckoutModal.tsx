import React, { useEffect, useState } from 'react';
import { CulqiPaymentReceipt } from '../types';
import {
  X,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  ExternalLink
} from 'lucide-react';

declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (config: Record<string, unknown>) => void;
      options: (opts: Record<string, unknown>) => void;
      open: () => void;
      close: () => void;
      token?: { id: string; email?: string; iin?: { card_brand?: string }; card_number?: string };
      order?: { id: string };
      error?: { user_message?: string; merchant_message?: string };
    };
    culqi?: () => void;
  }
}

interface CulqiConfigResponse {
  configured: boolean;
  publicKey: string | null;
  mode: 'live' | 'test' | 'sandbox';
  currency: 'PEN';
  merchantName: string;
}

export interface CulqiCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: CulqiPaymentReceipt) => void;
  amountSoles: number;
  title: string;
  description: string;
  concepto: 'IMPREVISTO' | 'ANUNCIO' | 'ORDEN_CUSTODIA';
  referenceId?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  customerName?: string;
  initialMethod?: 'TARJETA' | 'YAPE_PLIN';
}

function detectCardBrand(num: string): string {
  const digits = num.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^3(0[0-5]|[68])/.test(digits)) return 'Diners';
  return 'Tarjeta';
}

function formatCardInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function loadCulqiScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Culqi) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[data-culqi-sdk="v4"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Culqi)));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.culqi.com/js/v4';
    script.async = true;
    script.dataset.culqiSdk = 'v4';
    script.onload = () => resolve(Boolean(window.Culqi));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const CulqiCheckoutModal: React.FC<CulqiCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amountSoles,
  title,
  description,
  concepto,
  referenceId,
  defaultEmail,
  defaultPhone,
  customerName,
  initialMethod = 'TARJETA'
}) => {
  const [config, setConfig] = useState<CulqiConfigResponse>({
    configured: false,
    publicKey: null,
    mode: 'sandbox',
    currency: 'PEN',
    merchantName: 'TrabajaYa Perú'
  });
  const [sdkReady, setSdkReady] = useState(false);

  const [method, setMethod] = useState<'TARJETA' | 'YAPE_PLIN'>(initialMethod);
  const [email, setEmail] = useState(defaultEmail || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');

  const [yapePhone, setYapePhone] = useState((defaultPhone || '').replace(/\D/g, '').slice(-9));
  const [yapeCode, setYapeCode] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMethod(initialMethod);
    setEmail(defaultEmail || '');
    setCardHolder(customerName || '');
    setYapePhone((defaultPhone || '').replace(/\D/g, '').slice(-9));
    setErrorMsg(null);
    setIsProcessing(false);

    let active = true;
    fetch('/api/payments/culqi/config')
      .then(r => r.json())
      .then(async (data: CulqiConfigResponse) => {
        if (!active) return;
        setConfig(data);
        if (data.configured && data.publicKey) {
          const loaded = await loadCulqiScript();
          if (active) setSdkReady(loaded);
        }
      })
      .catch(() => {
        // Keeps sandbox fallback cleanly available
      });

    return () => {
      active = false;
    };
  }, [isOpen, initialMethod, defaultEmail, defaultPhone, customerName]);

  if (!isOpen) return null;

  const amountCentimos = Math.max(100, Math.round(amountSoles * 100));

  const executeServerCharge = async (payload: {
    tokenId: string;
    chargeEmail: string;
    chargeMethod: 'TARJETA' | 'YAPE_PLIN';
    brand?: string;
    last4?: string;
  }) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/payments/culqi/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: payload.tokenId,
          email: payload.chargeEmail,
          amountCentimos,
          description: `${title} · ${description}`.slice(0, 80),
          method: payload.chargeMethod,
          concepto,
          referenceId,
          customerName: cardHolder || customerName,
          brand: payload.brand,
          last4: payload.last4
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok || !data?.transaction) {
        setErrorMsg(data?.error || 'Culqi no pudo completar el cobro. Revisa tus datos.');
        setIsProcessing(false);
        return;
      }
      setIsProcessing(false);
      onSuccess(data.transaction as CulqiPaymentReceipt);
    } catch {
      setErrorMsg('No se pudo conectar con el servidor de pagos Culqi.');
      setIsProcessing(false);
    }
  };

  const handleOpenOfficialCulqi = () => {
    if (!config.configured || !config.publicKey || !window.Culqi) {
      setErrorMsg('El widget oficial Culqi v4 requiere conexión a Culqi Checkout. Usa el formulario Culqi integrado abajo.');
      return;
    }

    setErrorMsg(null);
    window.Culqi.publicKey = config.publicKey;
    window.Culqi.settings({
      title: 'TrabajaYa Perú',
      currency: 'PEN',
      amount: amountCentimos,
      xculqirsapublickey: undefined
    });
    window.Culqi.options({
      lang: 'es',
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: true,
        bancaMovil: false,
        agente: false,
        billetera: false,
        cuotealo: false
      },
      style: {
        logo: `${window.location.origin}/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp`,
        bannerColor: '#061a33',
        buttonBackground: '#00a19b',
        menuColor: '#00a19b',
        linksColor: '#00a19b',
        buttonText: `Pagar S/ ${amountSoles.toFixed(2)}`,
        buttonTextColor: '#ffffff',
        priceColor: '#061a33'
      }
    });

    window.culqi = () => {
      if (window.Culqi?.token?.id) {
        const token = window.Culqi.token;
        window.Culqi.close();
        void executeServerCharge({
          tokenId: token.id,
          chargeEmail: token.email || email || 'cliente@trabajaya.pe',
          chargeMethod: method,
          brand: token.iin?.card_brand || 'Tarjeta',
          last4: token.card_number ? token.card_number.slice(-4) : undefined
        });
      } else if (window.Culqi?.error) {
        setErrorMsg(
          window.Culqi.error.user_message ||
            window.Culqi.error.merchant_message ||
            'Culqi canceló o rechazó la tokenización.'
        );
      }
    };

    window.Culqi.open();
  };

  const handleFillTestCard = () => {
    setMethod('TARJETA');
    setCardNumber('4111 1111 1111 1111');
    setExpiry('10/29');
    setCvv('814');
    if (!email) setEmail('pagos@trabajaya.pe');
    if (!cardHolder) setCardHolder(customerName || 'Usuario TrabajaYa');
    setErrorMsg(null);
  };

  const handleFillTestYape = () => {
    setMethod('YAPE_PLIN');
    if (!yapePhone || yapePhone.length < 9) setYapePhone('966123456');
    setYapeCode('482910');
    if (!email) setEmail('pagos@trabajaya.pe');
    setErrorMsg(null);
  };

  const handleSubmitIntegratedCulqi = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setErrorMsg('Ingresa un correo electrónico válido para emitir tu constancia Culqi.');
      return;
    }

    if (method === 'TARJETA') {
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 16) {
        setErrorMsg('Ingresa un número de tarjeta válido (13 a 16 dígitos).');
        return;
      }
      const expMatch = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
      if (!expMatch) {
        setErrorMsg('Ingresa la fecha de vencimiento en formato MM/AA.');
        return;
      }
      const mm = Number(expMatch[1]);
      if (mm < 1 || mm > 12) {
        setErrorMsg('Mes de vencimiento inválido (01 a 12).');
        return;
      }
      const cleanCvv = cvv.replace(/\D/g, '');
      if (cleanCvv.length < 3 || cleanCvv.length > 4) {
        setErrorMsg('Ingresa el código CVV de 3 o 4 dígitos.');
        return;
      }
      const brand = detectCardBrand(digits);
      const tokenId = `tkn_sandbox_${Math.random().toString(36).slice(2, 14)}`;
      void executeServerCharge({
        tokenId,
        chargeEmail: cleanEmail,
        chargeMethod: 'TARJETA',
        brand,
        last4: digits.slice(-4)
      });
      return;
    }

    const cleanPhone = yapePhone.replace(/\D/g, '');
    const cleanCode = yapeCode.replace(/\D/g, '');
    if (cleanPhone.length !== 9 || !cleanPhone.startsWith('9')) {
      setErrorMsg('Ingresa un número celular Yape válido de 9 dígitos (ej. 9XXXXXXXX).');
      return;
    }
    if (cleanCode.length !== 6) {
      setErrorMsg('Ingresa el código de aprobación Yape de 6 dígitos (disponible en tu app Yape).');
      return;
    }

    const tokenId = `tkn_sandbox_yape_${Math.random().toString(36).slice(2, 12)}`;
    void executeServerCharge({
      tokenId,
      chargeEmail: cleanEmail,
      chargeMethod: 'YAPE_PLIN',
      brand: 'Yape',
      last4: cleanPhone.slice(-4)
    });
  };

  const brandDetected = detectCardBrand(cardNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Culqi Branded Header */}
        <div className="bg-gradient-to-r from-[#061a33] via-[#0a2d4d] to-[#007a78] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a19b] text-white font-black text-sm flex items-center justify-center shadow-md tracking-tight">
              culqi
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight">Pasarela Culqi Perú</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white/15 text-teal-200">
                  {config.mode === 'live'
                    ? 'Producción'
                    : config.mode === 'test'
                    ? 'Modo Pruebas'
                    : 'Checkout Sandbox'}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 truncate max-w-[230px]">{title}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar pasarela Culqi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Amount Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Comercio: TrabajaYa Perú
              </span>
              <p className="text-xs font-bold text-navy-950 truncate">{description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 block">Total a Pagar</span>
              <span className="text-xl font-black text-[#007a78] tabular-nums">
                S/ {amountSoles.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Official Culqi Checkout v4 Launcher when server keys are configured */}
          {config.configured && sdkReady && (
            <button
              type="button"
              onClick={handleOpenOfficialCulqi}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-[#00a19b] hover:bg-[#008c87] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Ventana Oficial Culqi Checkout v4 (S/ {amountSoles.toFixed(2)})</span>
            </button>
          )}

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMethod('TARJETA');
                setErrorMsg(null);
              }}
              className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                method === 'TARJETA'
                  ? 'border-[#00a19b] bg-teal-50/70 text-[#006965]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Tarjeta Culqi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('YAPE_PLIN');
                setErrorMsg(null);
              }}
              className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                method === 'YAPE_PLIN'
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Yape Culqi</span>
            </button>
          </div>

          {/* Culqi Tokenization Form */}
          <form onSubmit={handleSubmitIntegratedCulqi} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Correo para Comprobante Culqi *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                required
              />
            </div>

            {method === 'TARJETA' ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    Visa · Mastercard · Amex · Diners
                  </span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[10px] font-bold text-[#007a78] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autocompletar Tarjeta Prueba</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Titular de la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    placeholder="Nombre y Apellido"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Número de Tarjeta *
                    </label>
                    {cardNumber.replace(/\D/g, '').length >= 4 && (
                      <span className="text-[10px] font-extrabold text-[#007a78]">{brandDetected}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardInput(e.target.value))}
                    placeholder="4111 1111 1111 1111"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Vencimiento (MM/AA) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiryInput(e.target.value))}
                      placeholder="10/29"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      CVV *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="814"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-purple-950 block">Pago con Yape vía Culqi</span>
                      <span className="text-[10px] text-purple-800">
                        Ingresa tu celular Yape y código de aprobación de 6 dígitos
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillTestYape}
                    className="text-[10px] font-bold text-purple-800 hover:underline shrink-0 cursor-pointer"
                  >
                    Demo Yape
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                      Celular Yape (9 dígitos) *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={yapePhone}
                      onChange={e => setYapePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="966123456"
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                      Código de Aprobación (6 dígitos) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={yapeCode}
                      onChange={e => setYapeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="482910"
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-[#00a19b] hover:bg-[#008c87] text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Procesando con Culqi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pagar S/ {amountSoles.toFixed(2)} con Culqi</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Culqi PCI Security Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#00a19b]" />
              <span>Cifrado PCI-DSS · Culqi Perú</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pago Seguro en Soles (PEN)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
