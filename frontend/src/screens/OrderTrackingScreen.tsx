import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChefHat, PackageCheck, Phone } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { QRCodeSVG } from 'qrcode.react';

type OrderStatus = 'received' | 'preparing' | 'ready';

const steps = [
  { key: 'received' as OrderStatus, label: 'Order Received', icon: CheckCircle2, color: '#10B981' },
  { key: 'preparing' as OrderStatus, label: 'Preparing', icon: ChefHat, color: '#FF6B35' },
  { key: 'ready' as OrderStatus, label: 'Ready for Pickup', icon: PackageCheck, color: '#3B82F6' },
];

const statusMessages: Record<OrderStatus, string> = {
  received: 'Your order has been confirmed ✓',
  preparing: 'Chef is cooking your order 👨\u200d🍳✨',
  ready: 'Your order is ready! Pick it up now 🎉',
};

export default function OrderTrackingScreen() {
  const { state, goBack, dispatch } = useApp();
  const [status, setStatus] = useState<OrderStatus>('received');
  const [progress, setProgress] = useState(15);
  const [queueAhead, setQueueAhead] = useState(5);
  const [pickedUp, setPickedUp] = useState(false);
  const token = state.tokenNumber || 'A-042';

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        if (prev === 'received') return 'preparing';
        if (prev === 'preparing') return 'ready';
        return prev;
      });
      setProgress(prev => Math.min(prev + 35, 100));
      setQueueAhead(prev => Math.max(prev - 1, 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentStepIndex = steps.findIndex(s => s.key === status);

  const handlePickedUp = () => {
    setPickedUp(true);
    setTimeout(() => {
      dispatch({ type: 'SET_TAB', tab: 'home' });
    }, 1500);
  };

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={goBack} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </motion.button>
        <h1 className="text-xl font-bold text-white flex-1">Order Tracking</h1>
        <span className="px-3 py-1 rounded-full food-gradient text-white text-xs font-bold">{token}</span>
      </div>

      {/* Token & QR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-4 bg-card rounded-2xl p-4 flex items-center justify-between"
      >
        <div>
          <p className="text-4xl font-extrabold text-[#FF6B35] text-shadow-token tracking-tighter">{token}</p>
          <p className="text-[10px] text-[#6B6B6B] mt-1">Main Canteen • Counter #3</p>
        </div>
        <div className="bg-card-elevated p-1.5 rounded-xl">
          <QRCodeSVG value={`FASTFEAST:${token}`} size={56} bgColor="#1A1A1A" fgColor="#FFFFFF" level="L" />
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="mx-4 mt-6">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-white/10" />
          {/* Active line */}
          <motion.div
            className="absolute left-[23px] top-6 w-0.5"
            style={{
              background: 'linear-gradient(180deg, #10B981, #FF6B35)',
            }}
            animate={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />

          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const isPending = i > currentStepIndex;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="flex items-start gap-4 relative mb-6 last:mb-0"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-500 ${
                    isCompleted ? 'green-gradient' : isCurrent ? 'food-gradient' : 'bg-card-elevated'
                  }`}
                  style={isCurrent ? { boxShadow: `0 0 20px ${step.color}40` } : {}}
                >
                  {isCurrent && (
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <StepIcon size={22} className="text-white" />
                    </motion.div>
                  )}
                  {isCompleted && <CheckCircle2 size={22} className="text-white" />}
                  {isPending && <StepIcon size={22} className="text-[#6B6B6B]" />}
                </div>

                {/* Label */}
                <div className="pt-2">
                  <p className={`text-sm font-semibold ${isPending ? 'text-[#6B6B6B]' : 'text-white'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-[#6B6B6B] mt-0.5">
                    {isCompleted ? 'Completed' : isCurrent ? 'In progress...' : 'Waiting'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 text-center"
      >
        <p className="text-lg font-semibold text-white">{statusMessages[status]}</p>
      </motion.div>

      {/* Progress Ring */}
      <div className="flex justify-center mt-5">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1A1A1A" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              stroke={progress > 70 ? '#10B981' : progress > 35 ? '#FF6B35' : '#F59E0B'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              animate={{ strokeDashoffset: `${2 * Math.PI * 42 * (1 - progress / 100)}` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#FF6B35]">{Math.max(0, Math.ceil((100 - progress) / 100 * 20))}</span>
            <span className="text-[9px] text-[#6B6B6B]">mins left</span>
          </div>
        </div>
      </div>

      {/* Queue Position */}
      <div className="mx-4 mt-4 bg-card rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#A0A0A0]">{queueAhead} orders ahead</span>
        </div>
        <div className="w-24 h-1 bg-card-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full green-gradient"
            animate={{ width: `${(1 - queueAhead / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Call Canteen */}
      <div className="mx-4 mt-3 bg-card rounded-2xl p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Main Canteen</p>
          <p className="text-[10px] text-[#6B6B6B]">Counter #3</p>
        </div>
        <motion.button whileTap={{ scale: 0.92 }} className="w-10 h-10 rounded-full bg-card-elevated flex items-center justify-center">
          <Phone size={18} className="text-green-400" />
        </motion.button>
      </div>

      {/* Picked Up Button */}
      {status === 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mt-5 pb-8"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePickedUp}
            className={`w-full h-14 rounded-full font-semibold text-base transition-all ${
              pickedUp ? 'green-gradient text-white' : 'food-gradient text-white shadow-glow-orange'
            }`}
          >
            {pickedUp ? 'Enjoy your meal! 🍽️' : "I've Picked Up ✓"}
          </motion.button>
        </motion.div>
      )}

      {!pickedUp && status !== 'ready' && <div className="h-8" />}
    </div>
  );
}
