import React, { useState, useEffect } from 'react';
import {
  CampoArchivoVerificacion,
  ExpedienteCumplimientoPayload,
  useConecta
} from '../context/ConectaContext';
import {
  ComprobanteDomicilioTipo,
  InventarioHerramientaItem,
  TipoComprobanteTributario,
  TipoContratoLaboral,
  TipoDocumentoIdentidad,
  UsuarioRegistrado
} from '../types';
import { readCertificateFile } from '../utils/mediaUpload';
import {
  AlertCircle,
  Award,
  Building2,
  Car,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FileSignature,
  FileText,
  HeartPulse,
  Home,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  Wrench
} from 'lucide-react';

interface ExpedienteCumplimientoSectionProps {
  user: UsuarioRegistrado;
  mode: 'owner' | 'admin';
}

const formatFechaFirma = () =>
  new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

export const ExpedienteCumplimientoSection: React.FC<ExpedienteCumplimientoSectionProps> = ({
  user,
  mode
}) => {
  const {
    actualizarExpedienteCumplimiento,
    actualizarExpedientePorAdmin,
    eliminarArchivoVerificacionAdmin
  } = useConecta();

  const isOwner = mode === 'owner';

  // Block 1: Identity, Address proof & Emergency Family Contact
  const [tipoDoc, setTipoDoc] = useState<TipoDocumentoIdentidad>(user.tipoDocumento || 'DNI');
  const [numDoc, setNumDoc] = useState(user.dni || '');
  const [domicilioTipo, setDomicilioTipo] = useState<ComprobanteDomicilioTipo>(
    user.comprobanteDomicilioTipo || 'LUZ'
  );
  const [emergNombre, setEmergNombre] = useState(user.emergenciaFamiliarNombre || '');
  const [emergParentesco, setEmergParentesco] = useState(user.emergenciaFamiliarParentesco || '');
  const [emergTelefono, setEmergTelefono] = useState(user.emergenciaFamiliarTelefono || '');

  // Block 2: Tax & Legal (RUC)
  const [rucNumero, setRucNumero] = useState(user.rucNumero || '');
  const [rucActivo, setRucActivo] = useState<boolean>(user.rucActivo ?? true);
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobanteTributario>(
    user.tipoComprobanteTributario || 'RECIBO_HONORARIOS'
  );

  // Block 4: Technical certs & Driving license
  const [certDetalle, setCertDetalle] = useState(user.certificacionTecnicaDetalle || '');
  const [licNumero, setLicNumero] = useState(user.licenciaConducirNumero || '');
  const [licCategoria, setLicCategoria] = useState(user.licenciaConducirCategoria || 'A-I');

  // Block 5: Contracts, Conduct Rules & Tools Inventory
  const [contratoTipo, setContratoTipo] = useState<TipoContratoLaboral>(
    user.contratoTipo || 'LOCACION_SERVICIOS'
  );
  const [firmaTexto, setFirmaTexto] = useState(user.contratoFirmaNombre || user.nombreCompleto);
  const [aceptoNormasCheck, setAceptoNormasCheck] = useState(Boolean(user.normasConductaFirmadas));

  // New tool item inputs
  const [nuevoEquipo, setNuevoEquipo] = useState('');
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevaCantidad, setNuevaCantidad] = useState<number>(1);
  const [nuevoOrigen, setNuevoOrigen] = useState<'EMPRESA' | 'PROPIA'>('EMPRESA');

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackOk, setFeedbackOk] = useState<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<'todos' | 1 | 2 | 3 | 4 | 5>('todos');

  useEffect(() => {
    setTipoDoc(user.tipoDocumento || 'DNI');
    setNumDoc(user.dni || '');
    setDomicilioTipo(user.comprobanteDomicilioTipo || 'LUZ');
    setEmergNombre(user.emergenciaFamiliarNombre || '');
    setEmergParentesco(user.emergenciaFamiliarParentesco || '');
    setEmergTelefono(user.emergenciaFamiliarTelefono || '');
    setRucNumero(user.rucNumero || '');
    setRucActivo(user.rucActivo ?? true);
    setTipoComprobante(user.tipoComprobanteTributario || 'RECIBO_HONORARIOS');
    setCertDetalle(user.certificacionTecnicaDetalle || '');
    setLicNumero(user.licenciaConducirNumero || '');
    setLicCategoria(user.licenciaConducirCategoria || 'A-I');
    setContratoTipo(user.contratoTipo || 'LOCACION_SERVICIOS');
    setFirmaTexto(user.contratoFirmaNombre || user.nombreCompleto);
    setAceptoNormasCheck(Boolean(user.normasConductaFirmadas));
    setFeedbackError(null);
  }, [user]);

  const savePayload = (payload: ExpedienteCumplimientoPayload, successMsg?: string) => {
    setFeedbackError(null);
    setFeedbackOk(null);
    const res = isOwner
      ? actualizarExpedienteCumplimiento(payload)
      : actualizarExpedientePorAdmin(user.id, payload);
    if (!res.ok) {
      setFeedbackError(res.error || 'No se pudo guardar la información.');
      return false;
    }
    if (successMsg) setFeedbackOk(successMsg);
    return true;
  };

  const handleUploadDoc = async (
    file: File | undefined,
    urlKey: keyof ExpedienteCumplimientoPayload,
    nameKey: keyof ExpedienteCumplimientoPayload,
    extra?: ExpedienteCumplimientoPayload
  ) => {
    if (!file) return;
    setFeedbackError(null);
    try {
      const res = await readCertificateFile(file);
      savePayload(
        {
          ...(extra || {}),
          [urlKey]: res.url,
          [nameKey]: res.fileName
        },
        res.warning || `Archivo "${res.fileName}" guardado correctamente.`
      );
    } catch (err: any) {
      setFeedbackError(err?.message || 'Error al procesar el archivo.');
    }
  };

  const handleDeleteAdminFile = (campo: CampoArchivoVerificacion) => {
    eliminarArchivoVerificacionAdmin(user.id, campo);
  };

  const handleSaveBlock1 = (e: React.FormEvent) => {
    e.preventDefault();
    savePayload(
      {
        tipoDocumento: tipoDoc,
        dni: numDoc,
        comprobanteDomicilioTipo: domicilioTipo,
        emergenciaFamiliarNombre: emergNombre,
        emergenciaFamiliarParentesco: emergParentesco,
        emergenciaFamiliarTelefono: emergTelefono
      },
      'Documentación de identidad, domicilio y contacto familiar guardada.'
    );
  };

  const handleSaveBlock2 = (e: React.FormEvent) => {
    e.preventDefault();
    savePayload(
      {
        rucNumero,
        rucActivo,
        tipoComprobanteTributario: tipoComprobante
      },
      'Datos tributarios y RUC actualizados.'
    );
  };

  const handleSaveBlock4 = (e: React.FormEvent) => {
    e.preventDefault();
    savePayload(
      {
        certificacionTecnicaDetalle: certDetalle,
        licenciaConducirNumero: licNumero,
        licenciaConducirCategoria: licCategoria
      },
      'Validaciones técnicas y licencia de conducir actualizadas.'
    );
  };

  const handleSignContract = () => {
    if (firmaTexto.trim().length < 4) {
      setFeedbackError('Escribe tu nombre completo como firma digital del contrato.');
      return;
    }
    savePayload(
      {
        contratoTipo,
        contratoFirmado: true,
        contratoFirmaNombre: firmaTexto.trim(),
        contratoFechaFirma: formatFechaFirma()
      },
      'Contrato firmado digitalmente.'
    );
  };

  const handleSignNormas = () => {
    if (!aceptoNormasCheck) {
      setFeedbackError('Marca la casilla de aceptación del manual de normas de conducta.');
      return;
    }
    savePayload(
      {
        normasConductaFirmadas: true,
        normasConductaFecha: formatFechaFirma()
      },
      'Normas de conducta y trato al cliente firmadas.'
    );
  };

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEquipo.trim()) return;
    const currentList = user.inventarioHerramientas || [];
    const newItem: InventarioHerramientaItem = {
      id: `INV-${Date.now()}`,
      equipo: nuevoEquipo.trim(),
      codigoSerie: nuevoCodigo.trim() || 'S/N',
      cantidad: Math.max(1, Number(nuevaCantidad) || 1),
      estado: 'OPERATIVO',
      origen: nuevoOrigen
    };
    const ok = savePayload(
      {
        inventarioHerramientas: [...currentList, newItem],
        inventarioFirmado: false
      },
      `Equipo "${newItem.equipo}" agregado al inventario.`
    );
    if (ok) {
      setNuevoEquipo('');
      setNuevoCodigo('');
      setNuevaCantidad(1);
    }
  };

  const handleRemoveTool = (id: string) => {
    const currentList = user.inventarioHerramientas || [];
    savePayload({
      inventarioHerramientas: currentList.filter(i => i.id !== id),
      inventarioFirmado: false
    });
  };

  const handleSignInventory = () => {
    savePayload(
      {
        inventarioHerramientas: user.inventarioHerramientas || [],
        inventarioFirmado: true,
        inventarioFechaFirma: formatFechaFirma()
      },
      'Inventario de herramientas y EPP firmado.'
    );
  };

  // Completeness indicators for the 5 blocks
  const block1Done = Boolean(
    user.dni &&
      (user.comprobanteDomicilioUrl || user.comprobanteDomicilioNombre) &&
      user.emergenciaFamiliarNombre &&
      user.emergenciaFamiliarTelefono
  );
  const block2Done = Boolean(user.rucNumero && user.rucNumero.length === 11);
  const block3Done = Boolean(
    (user.antecedentesPolicialesUrl || user.antecedentesPolicialesNombre) &&
      (user.antecedentesPenalesUrl || user.antecedentesPenalesNombre) &&
      (user.antecedentesJudicialesUrl || user.antecedentesJudicialesNombre)
  );
  const block4Done = Boolean(
    user.certificacionTecnicaDetalle ||
      user.certificadoOpcionalUrl ||
      user.certificadoOpcionalNombre ||
      user.licenciaConducirNumero
  );
  const block5Done = Boolean(
    user.contratoFirmado && user.normasConductaFirmadas && user.inventarioFirmado
  );

  const completedCount = [block1Done, block2Done, block3Done, block4Done, block5Done].filter(
    Boolean
  ).length;

  const renderDocPreview = (
    title: string,
    url: string | undefined,
    fileName: string | undefined,
    campo: CampoArchivoVerificacion,
    urlKey: keyof ExpedienteCumplimientoPayload,
    nameKey: keyof ExpedienteCumplimientoPayload,
    placeholder: string
  ) => {
    const hasFile = Boolean(url || fileName);
    return (
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2 text-xs">
        <div className="flex items-start justify-between gap-1.5">
          <span className="font-bold text-navy-950 leading-tight">{title}</span>
          {hasFile ? (
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-extrabold shrink-0">
              ✓ Adjunto
            </span>
          ) : (
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold shrink-0">
              Pendiente
            </span>
          )}
        </div>

        {url ? (
          url.startsWith('data:image/') ? (
            <img
              src={url}
              alt={title}
              className="w-full h-24 object-cover rounded-lg border border-slate-300"
            />
          ) : (
            <div className="p-2.5 bg-white rounded-lg border border-slate-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate font-semibold text-slate-700">
                  {fileName || 'Documento.pdf'}
                </span>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-sky-700 underline shrink-0"
              >
                Abrir
              </a>
            </div>
          )
        ) : fileName ? (
          <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1.5 text-emerald-900">
            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate font-semibold">{fileName}</span>
          </div>
        ) : (
          <div className="p-3 bg-white rounded-lg border border-dashed border-slate-300 text-center text-[11px] text-slate-400">
            {placeholder}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <label className="flex-1 cursor-pointer py-1.5 px-2.5 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            <span>{hasFile ? 'Reemplazar (Foto/PDF)' : 'Subir Foto o PDF'}</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => handleUploadDoc(e.target.files?.[0], urlKey, nameKey)}
            />
          </label>
          {!isOwner && url && (
            <button
              type="button"
              onClick={() => handleDeleteAdminFile(campo)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg"
              title="Retirar archivo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
      {/* Header + 5-block summary pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-navy-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>
              Expediente Completo de Confianza, Legalidad, Seguridad y Contratos (5 Bloques)
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOwner
              ? 'Completa los 5 bloques para acreditar tu identidad, RUC, antecedentes policiales/penales/judiciales, licencias técnicas y acuerdos firmados.'
              : 'Revisión y gestión administrativa del legajo completo del especialista o trabajador en campo.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
              completedCount === 5
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {completedCount}/5 Bloques Completos
          </span>
        </div>
      </div>

      {/* Block filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {[
          { id: 'todos', label: 'Ver los 5 Bloques' },
          { id: 1, label: `1. Identidad y Emergencia ${block1Done ? '✓' : ''}` },
          { id: 2, label: `2. Legal / RUC ${block2Done ? '✓' : ''}` },
          { id: 3, label: `3. Antecedentes ${block3Done ? '✓' : ''}` },
          { id: 4, label: `4. Licencias Técnicas ${block4Done ? '✓' : ''}` },
          { id: 5, label: `5. Contratos e Inventario ${block5Done ? '✓' : ''}` }
        ].map(tab => (
          <button
            key={String(tab.id)}
            type="button"
            onClick={() => setActiveBlock(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeBlock === tab.id
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedbackError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {feedbackOk && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackOk}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* BLOQUE 1: DOCUMENTACIÓN DE IDENTIDAD, DOMICILIO Y EMERGENCIA      */}
      {/* ================================================================= */}
      {(activeBlock === 'todos' || activeBlock === 1) && (
        <form
          onSubmit={handleSaveBlock1}
          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <h4 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>1. Documentación de Identidad, Comprobante de Domicilio y Contacto de Emergencia</span>
            </h4>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                block1Done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {block1Done ? '✓ Completo' : 'Por completar'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Documento *</label>
              <select
                value={tipoDoc}
                onChange={e => setTipoDoc(e.target.value as TipoDocumentoIdentidad)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Número de Documento *</label>
              <input
                type="text"
                value={numDoc}
                onChange={e =>
                  setNumDoc(
                    tipoDoc === 'DNI'
                      ? e.target.value.replace(/\D/g, '').slice(0, 8)
                      : e.target.value.toUpperCase().slice(0, 15)
                  )
                }
                placeholder={tipoDoc === 'DNI' ? '8 dígitos' : 'Ej. CE-00294812'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipo de Comprobante de Domicilio *
              </label>
              <select
                value={domicilioTipo}
                onChange={e => setDomicilioTipo(e.target.value as ComprobanteDomicilioTipo)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                <option value="LUZ">Recibo de Luz</option>
                <option value="AGUA">Recibo de Agua</option>
                <option value="TELEFONO">Recibo de Teléfono</option>
              </select>
            </div>
          </div>

          {/* Emergency family contact box */}
          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2.5">
            <span className="font-extrabold text-rose-950 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Contacto de Familiar para Emergencias (Accidentes Laborales)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={emergNombre}
                onChange={e => setEmergNombre(e.target.value)}
                placeholder="Nombre completo del familiar"
                className="px-3 py-2 bg-white border border-rose-200 rounded-xl"
              />
              <input
                type="text"
                value={emergParentesco}
                onChange={e => setEmergParentesco(e.target.value)}
                placeholder="Parentesco (Ej. Madre, Esposo/a, Hermano)"
                className="px-3 py-2 bg-white border border-rose-200 rounded-xl"
              />
              <input
                type="tel"
                value={emergTelefono}
                onChange={e => setEmergTelefono(e.target.value)}
                placeholder="Celular de emergencia (+51)"
                className="px-3 py-2 bg-white border border-rose-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderDocPreview(
              `Copia del ${tipoDoc === 'DNI' ? 'DNI' : tipoDoc === 'CE' ? 'Carnet de Extranjería' : 'Pasaporte'}`,
              user.dniFotoUrl,
              user.dniFotoUrl ? `${tipoDoc}_${user.dni}` : undefined,
              'dniFotoUrl',
              'dniFotoUrl',
              'dniFotoUrl',
              'Sube foto o PDF legible de tu documento de identidad'
            )}
            {renderDocPreview(
              `Comprobante de Domicilio (${domicilioTipo === 'AGUA' ? 'Agua' : domicilioTipo === 'LUZ' ? 'Luz' : 'Teléfono'})`,
              user.comprobanteDomicilioUrl,
              user.comprobanteDomicilioNombre,
              'comprobanteDomicilioUrl',
              'comprobanteDomicilioUrl',
              'comprobanteDomicilioNombre',
              'Recibo reciente de agua, luz o teléfono para verificar residencia real'
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Identidad y Contacto de Emergencia</span>
            </button>
          </div>
        </form>
      )}

      {/* ================================================================= */}
      {/* BLOQUE 2: DOCUMENTACIÓN LEGAL Y TRIBUTARIA (RUC)                  */}
      {/* ================================================================= */}
      {(activeBlock === 'todos' || activeBlock === 2) && (
        <form
          onSubmit={handleSaveBlock2}
          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <h4 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>2. Documentación Legal y Tributaria (Contratista Independiente / RUC SUNAT)</span>
            </h4>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                block2Done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {block2Done ? '✓ RUC Registrado' : 'Opcional / Contratista'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Número de RUC (11 dígitos)</label>
              <input
                type="text"
                value={rucNumero}
                onChange={e => setRucNumero(e.target.value.replace(/\D/g, '').slice(0, 11))}
                maxLength={11}
                placeholder="Ej. 10418293042"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Comprobante que Emite</label>
              <select
                value={tipoComprobante}
                onChange={e => setTipoComprobante(e.target.value as TipoComprobanteTributario)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                <option value="RECIBO_HONORARIOS">Recibo por Honorarios Electrónico</option>
                <option value="FACTURA">Factura Electrónica</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={rucActivo}
                  onChange={e => setRucActivo(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-bold text-slate-800">RUC Activo y Habido en SUNAT</span>
              </label>
            </div>
          </div>

          {renderDocPreview(
            'Constancia / Ficha RUC SUNAT (Opcional)',
            user.fichaRucUrl,
            user.fichaRucNombre,
            'fichaRucUrl',
            'fichaRucUrl',
            'fichaRucNombre',
            'Adjunta tu Ficha RUC para emitir Recibos por Honorarios o Facturas'
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Datos Tributarios (RUC)</span>
            </button>
          </div>
        </form>
      )}

      {/* ================================================================= */}
      {/* BLOQUE 3: SEGURIDAD Y ANTECEDENTES (POLICIALES, PENALES, JUDICIALES) */}
      {/* ================================================================= */}
      {(activeBlock === 'todos' || activeBlock === 3) && (
        <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
            <div>
              <h4 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                <span>3. Seguridad y Antecedentes (Indispensable para Ingresar a Hogares y Oficinas)</span>
              </h4>
              <p className="text-[11px] text-emerald-900 mt-0.5">
                Garantiza la máxima confianza a las familias y empresas adjuntando tus certificados oficiales vigentes.
              </p>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded font-bold text-[10px] self-start sm:self-auto ${
                block3Done ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-950'
              }`}
            >
              {block3Done ? '✓ 3/3 Antecedentes Adjuntos' : 'Faltan certificados'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {renderDocPreview(
              '1) Antecedentes Policiales (PNP)',
              user.antecedentesPolicialesUrl,
              user.antecedentesPolicialesNombre,
              'antecedentesPolicialesUrl',
              'antecedentesPolicialesUrl',
              'antecedentesPolicialesNombre',
              'Certificado de Antecedentes Policiales (PDF o imagen)'
            )}
            {renderDocPreview(
              '2) Antecedentes Penales (Poder Judicial)',
              user.antecedentesPenalesUrl,
              user.antecedentesPenalesNombre,
              'antecedentesPenalesUrl',
              'antecedentesPenalesUrl',
              'antecedentesPenalesNombre',
              'Certificado de Antecedentes Penales (PDF o imagen)'
            )}
            {renderDocPreview(
              '3) Antecedentes Judiciales (INPE)',
              user.antecedentesJudicialesUrl,
              user.antecedentesJudicialesNombre,
              'antecedentesJudicialesUrl',
              'antecedentesJudicialesUrl',
              'antecedentesJudicialesNombre',
              'Certificado de Antecedentes Judiciales (PDF o imagen)'
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* BLOQUE 4: VALIDACIONES TÉCNICAS Y LICENCIA DE CONDUCIR            */}
      {/* ================================================================= */}
      {(activeBlock === 'todos' || activeBlock === 4) && (
        <form
          onSubmit={handleSaveBlock4}
          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <h4 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>4. Validaciones Técnicas y Licencia de Conducir Vigente</span>
            </h4>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                block4Done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {block4Done ? '✓ Validado' : 'Por completar'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">
                Certificaciones Técnicas o Licencias Vigentes (Electricista, Gas IG-1/IG-2, SENATI, SENCICO, CAPECO)
              </label>
              <input
                type="text"
                value={certDetalle}
                onChange={e => setCertDetalle(e.target.value)}
                placeholder="Ej. Instalador Eléctrico Certificado SENATI · Reg. 2024-881 / Instalador Gas Osinergmin IG-1"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-slate-500" /> Número de Licencia de Conducir (Para vehículo o transporte de herramientas)
              </label>
              <input
                type="text"
                value={licNumero}
                onChange={e => setLicNumero(e.target.value.toUpperCase())}
                placeholder="Ej. Q40129384 (Opcional si usa movilidad)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría MTC</label>
              <select
                value={licCategoria}
                onChange={e => setLicCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                <option value="A-I">A-I (Particular / Camioneta)</option>
                <option value="A-IIa">A-IIa</option>
                <option value="A-IIb">A-IIb (Furgoneta / Carga)</option>
                <option value="A-III">A-III</option>
                <option value="B-IIc">B-IIc (Motocicleta / Trimóvil)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderDocPreview(
              'Copia de Certificación Técnica / Licencia de Oficio',
              user.certificadoOpcionalUrl,
              user.certificadoOpcionalNombre,
              'certificadoOpcionalUrl',
              'certificadoOpcionalUrl',
              'certificadoOpcionalNombre',
              'Diploma técnico, carnet de electricista o instalador de gas'
            )}
            {renderDocPreview(
              'Copia de Licencia de Conducir Vigente (MTC)',
              user.licenciaConducirUrl,
              user.licenciaConducirNombre,
              'licenciaConducirUrl',
              'licenciaConducirUrl',
              'licenciaConducirNombre',
              'Brevete vigente si traslada herramientas o usa vehículo asignado'
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Validaciones Técnicas</span>
            </button>
          </div>
        </form>
      )}

      {/* ================================================================= */}
      {/* BLOQUE 5: ACUERDOS, CONTRATO, NORMAS DE CONDUCTA E INVENTARIO     */}
      {/* ================================================================= */}
      {(activeBlock === 'todos' || activeBlock === 5) && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-5 text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <h4 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-navy-900" />
              <span>5. Acuerdos y Contratos Firmados (Contrato · Normas de Conducta · Inventario)</span>
            </h4>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                block5Done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {block5Done ? '✓ 3/3 Acuerdos Firmados' : 'Requiere firma'}
            </span>
          </div>

          {/* 5A. Contrato claro + 5B. Normas de conducta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 5A Contrato */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-navy-950 text-sm flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-sky-600" />
                  <span>5.1 Contrato Claro de Prestación / Trabajo</span>
                </strong>
                {user.contratoFirmado && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    ✓ Firmado ({user.contratoFechaFirma})
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Modalidad Contractual</label>
                <select
                  value={contratoTipo}
                  onChange={e => setContratoTipo(e.target.value as TipoContratoLaboral)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="LOCACION_SERVICIOS">
                    Contrato de Locación de Servicios (Contratista Independiente)
                  </option>
                  <option value="CONTRATO_TRABAJO">
                    Contrato de Trabajo (Personal Asignado)
                  </option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 leading-relaxed">
                <p>
                  <strong>• Tarifas:</strong> El especialista percibe su tarifa base acordada tras la conformidad del cliente en el sistema Escrow (descontando únicamente el fondo de garantía establecido).
                </p>
                <p>
                  <strong>• Horarios:</strong> Atención en turnos Mañana (08:00–12:00), Tarde (14:00–18:00) o Emergencias confirmadas.
                </p>
                <p>
                  <strong>• Responsabilidades:</strong> Ejecución bajo norma técnica vigente, garantía de reparación sin costo adicional por fallas atribuibles y resguardo de bienes del cliente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={firmaTexto}
                  onChange={e => setFirmaTexto(e.target.value)}
                  placeholder="Nombre completo como firma digital"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                />
                <button
                  type="button"
                  onClick={handleSignContract}
                  className="px-3.5 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-lg shrink-0"
                >
                  {user.contratoFirmado ? 'Actualizar Firma' : 'Firmar Contrato'}
                </button>
              </div>
            </div>

            {/* 5B Normas de conducta */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-navy-950 text-sm flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <span>5.2 Normas de Conducta (Reglamento Interno)</span>
                  </strong>
                  {user.normasConductaFirmadas && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                      ✓ Firmado ({user.normasConductaFecha})
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>1. Limpieza e Higiene:</strong> Proteger muebles/pisos antes de intervenir y dejar el área de trabajo completamente limpia y libre de residuos al finalizar.
                  </p>
                  <p>
                    <strong>2. Puntualidad:</strong> Llegar dentro de la ventana del turno confirmado y avisar con al menos 60 minutos de anticipación ante cualquier imprevisto vial.
                  </p>
                  <p>
                    <strong>3. Trato al Cliente:</strong> Saludo cordial, portar identificación y uniforme limpio, explicar el diagnóstico con transparencia y respetar la privacidad del hogar u oficina.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2 cursor-pointer p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={aceptoNormasCheck}
                    onChange={e => setAceptoNormasCheck(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600"
                  />
                  <span className="text-[11px] font-semibold text-emerald-950">
                    Acepto y firmo el Reglamento Interno de Limpieza, Puntualidad y Trato al Cliente.
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleSignNormas}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  {user.normasConductaFirmadas
                    ? '✓ Normas Firmadas (Volver a confirmar)'
                    : 'Firmar Normas de Conducta'}
                </button>
              </div>
            </div>
          </div>

          {/* 5C Inventario de Herramientas y EPP firmado */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong className="text-navy-950 text-sm flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>5.3 Inventario de Herramientas, Uniformes y EPP (Con Compromiso de Devolución)</span>
                </strong>
                <p className="text-[11px] text-slate-500">
                  Registra taladros, escaleras, uniformes o equipos de protección personal (EPP) asignados por la empresa o propios.
                </p>
              </div>
              {user.inventarioFirmado ? (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] shrink-0">
                  ✓ Inventario Firmado ({user.inventarioFechaFirma})
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg font-bold text-[11px] shrink-0">
                  Pendiente de Firma
                </span>
              )}
            </div>

            {(user.inventarioHerramientas || []).length === 0 ? (
              <p className="text-center py-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500">
                No hay herramientas ni uniformes asignados en el inventario aún.
              </p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-500">
                      <th className="p-2.5">Equipo / Herramienta / EPP</th>
                      <th className="p-2.5">Código / Serie</th>
                      <th className="p-2.5">Cant.</th>
                      <th className="p-2.5">Propiedad</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5 text-right">Quitar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(user.inventarioHerramientas || []).map(item => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-semibold text-navy-950">{item.equipo}</td>
                        <td className="p-2.5 font-mono text-slate-600">{item.codigoSerie}</td>
                        <td className="p-2.5 font-mono font-bold">{item.cantidad}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.origen === 'EMPRESA'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-sky-100 text-sky-900'
                            }`}
                          >
                            {item.origen === 'EMPRESA' ? 'Empresa (Devolver)' : 'Herramienta Propia'}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-emerald-700">{item.estado}</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(item.id)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add new tool row */}
            <form onSubmit={handleAddTool} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <input
                type="text"
                value={nuevoEquipo}
                onChange={e => setNuevoEquipo(e.target.value)}
                placeholder="Ej. Taladro percutor, Escalera 3m, Uniforme, Casco EPP..."
                className="sm:col-span-5 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={nuevoCodigo}
                onChange={e => setNuevoCodigo(e.target.value)}
                placeholder="Código / Serie"
                className="sm:col-span-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
              <input
                type="number"
                min={1}
                value={nuevaCantidad}
                onChange={e => setNuevaCantidad(Number(e.target.value))}
                className="sm:col-span-1 px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-center"
              />
              <select
                value={nuevoOrigen}
                onChange={e => setNuevoOrigen(e.target.value as 'EMPRESA' | 'PROPIA')}
                className="sm:col-span-2 px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="EMPRESA">De Empresa (A devolver)</option>
                <option value="PROPIA">Propia</option>
              </select>
              <button
                type="submit"
                className="sm:col-span-2 py-2 px-3 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-lg flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </form>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  El trabajador se compromete a cuidar y devolver los equipos marcados como <strong>De Empresa</strong> al concluir la relación.
                </span>
              </span>
              <button
                type="button"
                onClick={handleSignInventory}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-navy-950 font-extrabold rounded-lg shrink-0"
              >
                {user.inventarioFirmado ? '✓ Re-firmar Inventario' : 'Firmar Cargo de Inventario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
