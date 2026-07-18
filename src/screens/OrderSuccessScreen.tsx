import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export default function OrderSuccessScreen() {
  const { state, navigate, dispatch } = useApp();
  const [spinComplete, setSpinComplete] = useState(false);
  const token = state.tokenNumber || 'A-042';

  useEffect(() => {
    const t1 = setTimeout(() => setSpinComplete(true), 2000);
    const t2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#FF6B35', '#FF3B3B', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'],
      });
    }, 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleTrack = () => {
    navigate('orderTracking', 'push');
  };

  const handleOrderMore = () => {
    dispatch({ type: 'SET_TAB', tab: 'home' });
  };

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex justify-center pt-8"
      >
        <div className="w-24 h-24 rounded-full green-gradient flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <CheckCircle2 size={48} className="text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-white text-center mt-5 tracking-tight"
      >
        Order Placed! 🎉
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-[#A0A0A0] text-center mt-1"
      >
        Show this token at the counter
      </motion.p>

      {/* Token Number with 3D Spinner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-center mt-6"
      >
        <div
          className="w-[200px] h-[140px] rounded-3xl flex items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, transparent 70%)',
          }}
        >
          {/* 3D Spinning digits */}
          <div className="relative" style={{ perspective: '800px' }}>
            <motion.div
              animate={!spinComplete ? { rotateX: [0, -720, -360, 0] } : { rotateX: 0 }}
              transition={{
                duration: 2,
                ease: [0.25, 0.1, 0.25, 1],
                times: [0, 0.45, 0.75, 1],
              }}
              style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
              className="text-6xl font-extrabold text-shadow-token text-white tracking-tighter"
            >
              {token}
            </motion.div>
          </div>
        </div>
        <p className="text-[10px] text-[#6B6B6B] mt-2">Tap to copy token</p>
      </motion.div>

      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: spinComplete ? 1 : 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center mt-5"
      >
        <div className="bg-card p-3 rounded-2xl">
          <QRCodeSVG
            value={`FASTFEAST:${token}`}
            size={140}
            bgColor="#1A1A1A"
            fgColor="#FFFFFF"
            level="M"
          />
        </div>
        <p className="text-[10px] text-[#6B6B6B] mt-2">Scan at pickup counter</p>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="mx-4 md:mx-6 lg:mx-8 mt-5 glass-card p-4"
      >
        <p className="text-sm font-semibold text-white">Main Canteen</p>
        <div className="mt-2 space-y-1">
          {state.cart.length > 0 ? state.cart.map(item => (
            <div key={item.id} className="flex justify-between text-xs">
              <span className="text-[#A0A0A0]">{item.name} x{item.quantity}</span>
              <span className="text-white">₹{item.price * item.quantity}</span>
            </div>
          )) : (
            <div className="text-xs text-[#6B6B6B]">Your recent order</div>
          )}
        </div>
      </motion.div>

      {/* Time & Queue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="flex items-center justify-center gap-6 mt-5"
      >
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          <div>
            <p className="text-lg font-bold text-white">15-20 min</p>
            <p className="text-[10px] text-[#6B6B6B]">Estimated time</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#A0A0A0]" />
          <div>
            <p className="text-sm font-semibold text-white">5 orders ahead</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-green-400">Live updates</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4 }}
        className="px-4 md:px-6 lg:px-8 mt-6 pb-8 space-y-3 max-w-md mx-auto w-full"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleTrack}
          className="w-full h-14 rounded-full food-gradient text-white font-semibold text-base shadow-glow-orange"
        >
          Track My Order
        </motion.button>
        <button
          onClick={handleOrderMore}
          className="w-full h-12 text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors"
        >
          Order Something Else
        </button>
      </motion.div>
    </div>
  );
}
