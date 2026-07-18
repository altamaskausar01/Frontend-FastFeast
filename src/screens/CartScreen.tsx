import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { suggestedCombos } from '@/data/mockData';

export default function CartScreen() {
  const { state, goBack, navigate, updateQuantity, cartTotal, showToast } = useApp();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<Record<string, 'mild' | 'medium' | 'hot'>>({});

  const gst = Math.round(cartTotal * 0.05);
  const platformFee = 5;
  const discount = cartTotal > 200 ? 20 : 0;
  const finalTotal = cartTotal + gst + platformFee - discount;

  const handleProceed = () => {
    navigate('payment', 'push');
  };

  const handleAddCombo = (_comboId: string) => {
    showToast('Combo added!');
  };

  return (
    <div className="screen-surface h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 lg:px-8 pt-4 pb-3 flex-shrink-0">
        <motion.button whileTap={{ scale: 0.92 }} onClick={goBack} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-white">Your Cart</h1>
          <p className="text-xs text-[#A0A0A0]">{state.cart.length} item{state.cart.length !== 1 ? 's' : ''} from {state.cart[0]?.canteenId ? 'Main Canteen' : ''}</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 lg:px-8">
        {/* Cart Items */}
        <AnimatePresence>
          {state.cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-card rounded-2xl p-4 mb-2"
            >
              <div className="flex items-start gap-3">
                <img src={item.image} alt={item.name} className="w-12 xs:w-14 h-12 xs:h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                    <span className="text-sm font-bold text-[#FF6B35]">₹{item.price * item.quantity}</span>
                  </div>
                  <p className="text-[10px] text-[#6B6B6B] mt-0.5">{item.description}</p>

                  {/* Customization tags */}
                  {spiceLevel[item.id] && (
                    <div className="flex gap-1 mt-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF6B35]/15 text-[#FF6B35]">
                        {spiceLevel[item.id] === 'mild' ? 'Mild' : spiceLevel[item.id] === 'medium' ? 'Medium' : 'Extra Spicy'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2.5">
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-card-elevated flex items-center justify-center"
                      >
                        {item.quantity === 1 ? <Trash2 size={14} className="text-red-400" /> : <Minus size={14} className="text-white" />}
                      </motion.button>
                      <motion.span
                        key={item.quantity}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="text-base font-bold text-white w-6 text-center"
                      >
                        {item.quantity}
                      </motion.span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full food-gradient flex items-center justify-center"
                      >
                        <Plus size={14} className="text-white" />
                      </motion.button>
                    </div>

                    {/* Customize toggle */}
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="text-[11px] font-medium text-[#FF6B35] flex items-center gap-0.5"
                    >
                      Customize {expandedItem === item.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable customization */}
              <AnimatePresence>
                {expandedItem === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-white/[0.06]">
                      <p className="text-xs text-[#A0A0A0] mb-2">Spice Level</p>
                      <div className="flex gap-2">
                        {(['mild', 'medium', 'hot'] as const).map(level => (
                          <button
                            key={level}
                            onClick={() => setSpiceLevel(prev => ({ ...prev, [item.id]: level }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              spiceLevel[item.id] === level
                                ? 'food-gradient text-white'
                                : 'bg-card-elevated text-[#A0A0A0]'
                            }`}
                          >
                            {level === 'mild' ? '🌶️ Mild' : level === 'medium' ? '🌶️🌶️ Medium' : '🌶️🌶️🌶️ Hot'}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[#A0A0A0] mt-3 mb-2">Special Notes</p>
                      <textarea
                        placeholder="Any special requests..."
                        className="w-full h-16 bg-card-elevated rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#6B6B6B] outline-none resize-none border border-white/[0.06] focus:border-[#FF6B35]/30"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Suggested Combos */}
        {state.cart.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400" /> Frequently Bought Together
            </h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {suggestedCombos.map(combo => (
                <div key={combo.id} className="flex-shrink-0 w-[160px] xs:w-[180px] sm:w-[200px] bg-card rounded-xl p-3">
                  <p className="text-xs font-semibold text-white">{combo.name}</p>
                  <p className="text-[10px] text-[#6B6B6B] mt-0.5">{combo.items.join(' + ')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-sm font-bold text-[#FF6B35]">₹{combo.price}</span>
                      <span className="text-[9px] text-[#6B6B6B] line-through ml-1">₹{combo.originalPrice}</span>
                    </div>
                    <button
                      onClick={() => handleAddCombo(combo.id)}
                      className="px-3 py-1 rounded-full food-gradient text-white text-[10px] font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-[9px] text-green-400 mt-1">Save ₹{combo.savings}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bill Breakdown */}
        {state.cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-card rounded-2xl p-4"
          >
            <div className="space-y-2 max-w-xl mx-auto">
              <div className="flex justify-between text-sm">
                <span className="text-[#A0A0A0]">Item Total</span>
                <span className="text-white">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A0A0A0]">GST (5%)</span>
                <span className="text-[#A0A0A0]">₹{gst}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A0A0A0]">Platform Fee</span>
                <span className="text-[#A0A0A0]">₹{platformFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Discount</span>
                  <span className="text-green-400">-₹{discount}</span>
                </div>
              )}
              <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                <span className="text-base font-bold text-white">To Pay</span>
                <span className="text-base font-bold text-[#FF6B35]">₹{finalTotal}</span>
              </div>
            </div>
            {discount > 0 && (
              <div className="mt-2 inline-flex px-2 py-0.5 rounded-full green-gradient">
                <span className="text-[10px] text-white font-medium">You save ₹{discount}</span>
              </div>
            )}
          </motion.div>
        )}

        <div className="h-4" />
      </div>

      {/* Proceed Button */}
      {state.cart.length > 0 && (
        <div className="flex-shrink-0 p-4 md:px-6 lg:px-8 bg-page/95">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleProceed}
            className="w-full h-14 rounded-full food-gradient text-white font-semibold text-base shadow-glow-orange flex items-center justify-center gap-2"
          >
            Proceed to Pay ₹{finalTotal} <span>→</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
