import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wallet, Store, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { placeOrder } from '@/services/orders';
import { extractErrorMessage } from '@/services/api';
import confetti from 'canvas-confetti';

const PAYMENT_METHOD_MAP: Record<string, string> = {
  gpay: 'UPI',
  phonepe: 'UPI',
  paytm: 'Wallet',
  qbwallet: 'Wallet',
  counter: 'Counter',
};

export default function PaymentScreen() {
  const { state, goBack, navigate, cartTotal, dispatch, showToast } = useApp();
  const [selected, setSelected] = useState('gpay');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const paymentHandle = state.user.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\\.|\\.$)/g, '') || 'fastfeast.user';

  const paymentMethods = [
    { id: 'gpay', name: 'Google Pay', detail: `${paymentHandle}@oksbi`, icon: '💳', type: 'upi' },
    { id: 'phonepe', name: 'PhonePe', detail: `${paymentHandle}@ybl`, icon: '💳', type: 'upi' },
    { id: 'paytm', name: 'PayTM Wallet', detail: 'Balance: ₹45', icon: '💰', type: 'wallet' },
    { id: 'qbwallet', name: 'Fast Feast Wallet', detail: `Balance: ₹${state.user.walletBalance}`, icon: '⚡', type: 'wallet' },
    { id: 'counter', name: 'Pay at Counter', detail: 'Show token at pickup', icon: '🏪', type: 'counter' },
  ];

  const gst = Math.round(cartTotal * 0.05);
  const discount = cartTotal > 200 ? 20 : 0;
  const finalTotal = cartTotal + gst + 5 - discount;

  const handlePay = async () => {
    setProcessing(true);

    try {
      // Build the order payload from the cart
      const orderData = {
        canteenId: state.cart[0]?.canteenId || '',
        items: state.cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          spiceLevel: item.spiceLevel,
          specialNotes: undefined as string | undefined,
        })),
        paymentMethod: PAYMENT_METHOD_MAP[selected] || 'UPI',
      };

      const res = await placeOrder(orderData);
      const order = res.data;

      setProcessing(false);
      setSuccess(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#FF6B35', '#FF3B3B', '#8B5CF6', '#10B981', '#F59E0B'],
      });

      dispatch({ type: 'SET_ACTIVE_ORDER', orderId: order._id, token: order.token });
      dispatch({ type: 'CLEAR_CART' });

      setTimeout(() => {
        navigate('orderSuccess', 'push');
      }, 800);
    } catch (error) {
      setProcessing(false);
      showToast(extractErrorMessage(error), 'error');
    }
  };

  return (
    <div className="screen-surface h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 lg:px-8 pt-4 pb-3 flex-shrink-0">
        <motion.button whileTap={{ scale: 0.92 }} onClick={goBack} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </motion.button>
        <h1 className="text-xl font-bold text-white">Payment</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 lg:px-8">
        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-4 mb-4">
          <p className="text-xs text-[#A0A0A0]">Order Total</p>
          <p className="text-2xl font-bold text-[#FF6B35]">₹{finalTotal}</p>
          <p className="text-[10px] text-[#6B6B6B] mt-0.5">{state.cart.length} items • Including GST & fees</p>
        </div>

        {/* Payment Methods */}
        <h3 className="text-sm font-semibold text-white mb-2">Select Payment Method</h3>
        <div className="space-y-2">
          {paymentMethods.map((method, i) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(method.id)}
              className={`w-full bg-card rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 text-left ${
                selected === method.id ? 'border border-[#FF6B35]/40 shadow-[0_0_12px_rgba(255,107,53,0.15)]' : 'border border-transparent'
              }`}
            >
              {/* Radio */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                selected === method.id ? 'border-transparent food-gradient' : 'border-white/20'
              }`}>
                {selected === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-card-elevated flex items-center justify-center text-lg flex-shrink-0">
                {method.type === 'upi' && <span className="text-lg">📱</span>}
                {method.type === 'wallet' && <Wallet size={20} className="text-[#FF6B35]" />}
                {method.type === 'counter' && <Store size={20} className="text-[#A0A0A0]" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{method.name}</p>
                <p className="text-[10px] text-[#6B6B6B]">{method.detail}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Wallet top-up warning */}
        {selected === 'qbwallet' && state.user.walletBalance < finalTotal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-warning-bg rounded-xl p-3 flex items-center gap-2"
          >
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-xs text-amber-400 font-medium">Low wallet balance</p>
              <p className="text-[10px] text-amber-400/70">Add money to pay seamlessly</p>
            </div>
          </motion.div>
        )}

        <div className="h-4" />
      </div>

      {/* Pay Button */}
      <div className="flex-shrink-0 p-4 md:px-6 lg:px-8 bg-page/95">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full h-14 rounded-full green-gradient flex items-center justify-center gap-2"
            >
              <Check size={20} className="text-white" />
              <span className="text-white font-semibold">Payment Successful!</span>
            </motion.div>
          ) : (
            <motion.button
              key="pay"
              whileTap={{ scale: 0.97 }}
              onClick={handlePay}
              disabled={processing}
              className="w-full h-14 rounded-full food-gradient text-white font-semibold text-base shadow-glow-orange flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {processing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ₹{finalTotal}</>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
