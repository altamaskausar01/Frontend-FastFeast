import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const borderColors = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#FF3B3B',
};

export default function Toast() {
  const { state } = useApp();
  const toast = state.toast;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4"
        >
          <div
            className="max-w-[380px] w-full rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg"
            style={{
              background: '#242424',
              borderLeft: `4px solid ${borderColors[toast.type]}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {(() => {
              const Icon = icons[toast.type];
              return <Icon size={18} style={{ color: borderColors[toast.type] }} />;
            })()}
            <span className="text-sm text-white font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
