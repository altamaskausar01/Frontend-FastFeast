import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';

export default function StickyCartBar() {
  const { state, cartTotal, cartCount, navigate } = useApp();

  if (state.cart.length === 0) return null;

  const hiddenScreens = ['payment', 'orderSuccess', 'orderTracking', 'canteenDashboard', 'admin'];
  if (hiddenScreens.includes(state.screen)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex-shrink-0 w-full z-40 flex justify-center px-3 md:px-6 lg:px-8"
      >
        <div
          className="w-full max-w-[430px] sm:max-w-[540px] md:max-w-[640px] lg:max-w-[720px] xl:max-w-[800px] rounded-2xl px-4 md:px-5 py-3 flex items-center justify-between"
          style={{
            background: '#1A0D12',
            borderTop: '1px solid rgba(217, 74, 90, 0.08)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag size={20} className="text-[#D94A5A]" />
              <motion.span
                key={cartCount}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full food-gradient text-[9px] font-bold text-white flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            </div>
            <div>
              <p className="text-xs text-[#8A6A78]">{cartCount} item{cartCount > 1 ? 's' : ''}</p>
              <p className="text-lg font-bold text-[#D94A5A]">₹{cartTotal}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('cart', 'modal')}
            className="food-gradient text-white font-semibold text-sm px-6 py-2.5 rounded-full flex items-center gap-2"
            style={{ boxShadow: '0 4px 16px rgba(217, 74, 90, 0.35)' }}
          >
            View Cart
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
