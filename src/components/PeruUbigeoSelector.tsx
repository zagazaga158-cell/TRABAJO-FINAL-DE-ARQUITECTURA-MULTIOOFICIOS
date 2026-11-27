import React, { useMemo, useState } from 'react';
import { MapPin, Edit3 } from 'lucide-react';
import {
  REGIONES_PERU,
  getProvinciasByRegion,
  getDistritosByProvincia
} from '../data/peruUbigeo';

interface PeruUbigeoSelectorProps {
  mode?: 'form' | 'filter';
  region: string;
  provincia: string;
  distrito: string;
  onChange: (next: { region: string; provincia: string; distrito: string }) => void;
  compact?: boolean;
  dark?: boolean;
  className?: string;
  showLabels?: boolean;
}

export const PeruUbigeoSelector: React.FC<PeruUbigeoSelectorProps> = ({
  mode = 'form',
  region,
  provincia,
  distrito,
  onChange,
  compact = false,
  dark = false,
  className = '',
  showLabels = true
}) => {
  const [customDistrictMode, setCustomDistrictMode] = useState(false);

  const provincias = useMemo(() => {
    if (!region || region === 'TODOS') return [];
    return getProvinciasByRegion(region);
  }, [region]);

  const distritos = useMemo(() => {
    if (!region || region === 'TODOS' || !provincia || provincia === 'TODOS') return [];
    return getDistritosByProvincia(region, provincia);
  }, [region, provincia]);

  const isCustomValue = useMemo(() => {
    if (mode !== 'form') return false;
    if (!distrito || distritos.length === 0) return false;
    return !distritos.includes(distrito);
  }, [mode, distrito, distritos]);

  const handleRegionChange = (nextRegion: string) => {
    setCustomDistrictMode(false);
    if (mode === 'filter' && nextRegion === 'TODOS') {
      onChange({ region: 'TODOS', provincia: 'TODOS', distrito: 'TODOS' });
      return;
    }
    const nextProvs = getProvinciasByRegion(nextRegion);
    if (mode === 'filter') {
      onChange({ region: nextRegion, provincia: 'TODOS', distrito: 'TODOS' });
    } else {
      const firstProv = nextProvs[0] || '';
      const nextDists = firstProv ? getDistritosByProvincia(nextRegion, firstProv) : [];
      onChange({
        region: nextRegion,
        provincia: firstProv,
        distrito: nextDists[0] || ''
      });
    }
  };

  const handleProvinciaChange = (nextProv: string) => {
    setCustomDistrictMode(false);
    if (mode === 'filter' && nextProv === 'TODOS') {
      onChange({ region, provincia: 'TODOS', distrito: 'TODOS' });
      return;
    }
    const nextDists = getDistritosByProvincia(region, nextProv);
    if (mode === 'filter') {
      onChange({ region, provincia: nextProv, distrito: 'TODOS' });
    } else {
      onChange({
        region,
        provincia: nextProv,
        distrito: nextDists[0] || ''
      });
    }
  };

  const handleDistritoSelect = (nextDist: string) => {
    if (nextDist === '__CUSTOM__') {
      setCustomDistrictMode(true);
      onChange({ region, provincia, distrito: '' });
      return;
    }
    setCustomDistrictMode(false);
    onChange({ region, provincia, distrito: nextDist });
  };

  const baseSelectClass = dark
    ? `w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
        compact ? 'px-2.5 py-2 text-xs' : 'px-3.5 py-2.5 text-sm'
      }`
    : `w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
        compact ? 'px-2.5 py-2 text-xs' : 'px-3.5 py-2.5 text-sm'
      }`;

  const labelClass = dark
    ? `block font-bold uppercase tracking-wide text-slate-400 mb-1 ${compact ? 'text-[10px]' : 'text-xs'}`
    : `block font-bold text-slate-700 mb-1 ${compact ? 'text-[11px]' : 'text-xs'}`;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 ${className}`}>
      {/* Región / Departamento */}
      <div>
        {showLabels && (
          <label className={labelClass}>
            Región / Dept. {mode === 'form' ? '*' : ''}
          </label>
        )}
        <div className="relative">
          <select
            value={region}
            onChange={e => handleRegionChange(e.target.value)}
            className={baseSelectClass}
          >
            {mode === 'filter' && <option value="TODOS">🇵🇪 Todas las Regiones (25)</option>}
            {REGIONES_PERU.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provincia */}
      <div>
        {showLabels && (
          <label className={labelClass}>
            Provincia {mode === 'form' ? '*' : ''}
          </label>
        )}
        <select
          value={provincia}
          onChange={e => handleProvinciaChange(e.target.value)}
          disabled={mode === 'filter' && region === 'TODOS'}
          className={`${baseSelectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {mode === 'filter' && (
            <option value="TODOS">
              {region === 'TODOS' ? 'Elige región primero...' : `Todas las provincias (${provincias.length})`}
            </option>
          )}
          {provincias.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Distrito */}
      <div>
        {showLabels && (
          <label className={labelClass}>
            Distrito {mode === 'form' ? '*' : ''}
          </label>
        )}
        {mode === 'form' && (customDistrictMode || isCustomValue) ? (
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Nombre del distrito"
                value={distrito}
                onChange={e => onChange({ region, provincia, distrito: e.target.value })}
                className={`${baseSelectClass} pl-8`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomDistrictMode(false);
                onChange({ region, provincia, distrito: distritos[0] || '' });
              }}
              title="Volver a la lista oficial"
              className={`px-2 py-2 rounded-xl border text-[11px] font-bold shrink-0 ${
                dark
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Lista
            </button>
          </div>
        ) : (
          <div className="relative flex items-center gap-1">
            <select
              value={distrito}
              onChange={e => handleDistritoSelect(e.target.value)}
              disabled={mode === 'filter' && (region === 'TODOS' || provincia === 'TODOS')}
              className={`${baseSelectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {mode === 'filter' && (
                <option value="TODOS">
                  {provincia === 'TODOS' ? 'Elige provincia primero...' : `Todos los distritos (${distritos.length})`}
                </option>
              )}
              {distritos.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              {mode === 'form' && (
                <option value="__CUSTOM__">✏️ Otro distrito / centro poblado...</option>
              )}
            </select>
            {mode === 'form' && (
              <button
                type="button"
                onClick={() => setCustomDistrictMode(true)}
                title="Escribir distrito manualmente"
                className={`p-2 rounded-xl border shrink-0 transition-colors ${
                  dark
                    ? 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-blue-600'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
