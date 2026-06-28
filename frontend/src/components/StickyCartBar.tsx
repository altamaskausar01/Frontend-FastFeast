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
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute bottom-[4.75rem] left-0 right-0 z-40 flex justify-center px-4 md:px-6"
      >
        <div
          className="w-full max-w-[430px] sm:max-w-[640px] lg:max-w-[720px] rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{
            background: '#1E1E36',
            borderTop: '1px solid rgba(232, 63, 77, 0.10)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag size={22} className="text-[#FF6B35]" />
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
              <p className="text-xs text-[#A0A0A0]">{cartCount} item{cartCount > 1 ? 's' : ''}</p>
              <p className="text-lg font-bold text-[#E83F4D]">₹{cartTotal}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('cart', 'modal')}
            className="food-gradient text-white font-semibold text-sm px-6 py-2.5 rounded-full flex items-center gap-2"
            style={{ boxShadow: '0 4px 16px rgba(232, 63, 77, 0.35)' }}
          >
            View Cart
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
