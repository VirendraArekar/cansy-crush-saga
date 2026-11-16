import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Sparkles 
} from 'lucide-react';
import { useToastStore, ToastItem } from '../../store/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div 
      aria-live="polite"
      className="absolute top-3 left-3 z-[9999] pointer-events-none flex flex-col gap-2 max-w-[320px] w-[calc(100%-24px)] select-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard 
            key={toast.id} 
            toast={toast} 
            onDismiss={() => dismissToast(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const getStyle = () => {
    switch (toast.type) {
      case 'sweet':
        return {
          border: 'border-pink-400/90 shadow-[0_6px_25px_rgba(244,63,94,0.45)]',
          badgeBg: 'bg-gradient-to-tr from-pink-500 to-amber-400 text-slate-950',
          titleColor: 'text-amber-300',
          progressBar: 'bg-gradient-to-r from-pink-400 to-amber-300',
          icon: <span className="text-lg">🍬</span>,
        };
      case 'success':
        return {
          border: 'border-emerald-400/90 shadow-[0_6px_25px_rgba(16,185,129,0.4)]',
          badgeBg: 'bg-emerald-500 text-slate-950',
          titleColor: 'text-emerald-300',
          progressBar: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
      case 'warning':
        return {
          border: 'border-amber-400/90 shadow-[0_6px_25px_rgba(245,158,11,0.4)]',
          badgeBg: 'bg-amber-500 text-slate-950',
          titleColor: 'text-amber-300',
          progressBar: 'bg-amber-400',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-rose-500/90 shadow-[0_6px_25px_rgba(244,63,94,0.4)]',
          badgeBg: 'bg-rose-500 text-white',
          titleColor: 'text-rose-300',
          progressBar: 'bg-rose-500',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        };
      case 'info':
      default:
        return {
          border: 'border-sky-400/90 shadow-[0_6px_25px_rgba(56,189,248,0.4)]',
          badgeBg: 'bg-sky-500 text-slate-950',
          titleColor: 'text-sky-300',
          progressBar: 'bg-sky-400',
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -35, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -35, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl bg-slate-950/95 backdrop-blur-xl border-2 ${style.border} p-3 shadow-2xl flex items-start gap-2.5`}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {toast.icon ? <span className="text-xl">{toast.icon}</span> : style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4 text-left">
        {toast.title && (
          <h5 className={`text-xs font-black leading-tight truncate ${style.titleColor}`}>
            {toast.title}
          </h5>
        )}
        <p className="text-[11px] font-semibold text-slate-200 leading-snug break-words mt-0.5">
          {toast.message}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Duration Progress Bar at Bottom */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-1 ${style.progressBar} opacity-80`}
        />
      )}
    </motion.div>
  );
};
