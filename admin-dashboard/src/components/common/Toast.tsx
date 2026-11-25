import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastMessage } from '@/types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const icons = {
  success: <CheckCircle size={18} className="text-success" />,
  error: <XCircle size={18} className="text-danger" />,
  warning: <AlertTriangle size={18} className="text-warning" />,
  info: <Info size={18} className="text-info" />,
};

const bgColors = {
  success: 'bg-success-light border-success/20',
  error: 'bg-danger-light border-danger/20',
  warning: 'bg-warning-light border-warning/20',
  info: 'bg-info-light border-info/20',
};

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-text-primary flex-1">{toast.message}</p>
      <button onClick={onRemove} className="text-text-muted hover:text-text-primary cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
