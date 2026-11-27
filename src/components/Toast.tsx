import React from 'react';
import { useConecta } from '../context/ConectaContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useConecta();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-600 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-300 bg-emerald-50/95 text-emerald-950';
      case 'warning':
        return 'border-amber-300 bg-amber-50/95 text-amber-950';
      case 'info':
      default:
        return 'border-sky-300 bg-sky-50/95 text-sky-950';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300 pointer-events-none">
      <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 pointer-events-auto ${getBorderColor()}`}>
        {getIcon()}
        <div className="flex-1 text-xs">
          <h5 className="font-bold">{toast.title}</h5>
          <p className="mt-0.5 text-slate-700 leading-snug">{toast.desc}</p>
        </div>
      </div>
    </div>
  );
};
