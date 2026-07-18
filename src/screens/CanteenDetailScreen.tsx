import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, Plus, Minus, Search, Leaf, ShoppingBag, ChevronRight } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { getCanteenWithMenu, normalizeCanteen } from '@/services/canteens';
import { normalizeMenuItem } from '@/services/menu';
import type { Canteen, MenuItem } from '@/types';

export default function CanteenDetailScreen() {
  const { state, goBack, addToCart, updateQuantity, showToast, navigate } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!state.selectedCanteenId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getCanteenWithMenu(state.selectedCanteenId);
        setCanteen(normalizeCanteen(res.data.canteen));
        setMenuItems(res.data.menuItems.map(normalizeMenuItem));
      } catch {
        // Silent fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [state.selectedCanteenId]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== 'All') {
      items = items.filter(m => m.category === activeCategory);
    }
    if (searchQuery) {
      items = items.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const getItemQty = (itemId: string) => {
    const cartItem = state.cart.find(c => c.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAdd = (item: MenuItem) => {
    addToCart(item.id, { ...item, quantity: 1 });
    showToast(`${item.name} added to cart!`);
  };

  const handleViewCart = () => {
    navigate('cart', 'modal');
  };

  if (loading) {
    return (
      <div className="screen-surface h-full flex items-center justify-center">
        <div className="animate-pulse text-[#6B4D5A]">Loading menu...</div>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="screen-surface h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-4">
          <motion.button whileTap={{ scale: 0.92 }} onClick={goBack} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </motion.button>
          <h1 className="text-xl font-bold text-white">Canteen not found</h1>
        </div>
      </div>
    );
  }

  const cartItemCount = state.cart.filter(item => item.canteenId === canteen.id).length;
  const cartItemsForCanteen = state.cart.filter(item => item.canteenId === canteen.id);
  const canteenCartTotal = cartItemsForCanteen.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="screen-surface h-full flex flex-col">
      {/* Header with Banner */}
      <div className="relative flex-shrink-0">
        <div className="h-[160px] xs:h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px] relative overflow-hidden">
          <img src={canteen.bannerImage} alt={canteen.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508] via-[#0A0508]/30 to-transparent" />
        </div>

        {/* Back button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={goBack}
          className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center z-10"
        >
          <ArrowLeft size={20} className="text-white" />
        </motion.button>

        {/* Canteen Info */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 lg:px-8 pb-3 md:pb-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">{canteen.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-white font-medium">{canteen.rating}</span>
              <span className="text-xs text-[#6B4D5A]">({canteen.ratingCount} ratings)</span>
            </div>
            <div className="flex gap-1.5">
              {canteen.tags.map(t => (
                <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white/80">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: canteen.rushLevel === 'low' ? '#10B981' : canteen.rushLevel === 'medium' ? '#F59E0B' : '#FF3B3B',
                boxShadow: `0 0 8px ${canteen.rushLevel === 'low' ? '#10B981' : canteen.rushLevel === 'medium' ? '#F59E0B' : '#FF3B3B'}60`,
              }}
            />
            <span className="text-[11px] text-[#8A6A78]">
              {canteen.rushLevel === 'low' ? 'Low' : canteen.rushLevel === 'medium' ? 'Medium' : 'High'} Rush • {canteen.avgWaitTime} avg wait
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 md:px-6 lg:px-8 pt-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto h-11 md:h-13 rounded-full bg-card-elevated border border-white/[0.06] flex items-center px-4 gap-2.5">
          <Search size={16} className="text-[#6B4D5A]" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#6B4D5A] outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 md:px-6 lg:px-8 pt-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {canteen.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? 'food-gradient text-white'
                  : 'bg-card border border-white/[0.08] text-[#8A6A78]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 lg:px-8 pt-3 pb-4">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">{category}</h3>
            <div className="flex flex-col gap-2 max-w-3xl">
              {items.map((item, i) => {
                const qty = getItemQty(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-2xl p-3 flex gap-3"
                  >
                    <img src={item.image} alt={item.name} className="w-16 xs:w-20 h-16 xs:h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                        <Leaf size={12} className={item.isVeg ? 'text-green-500' : 'text-red-500'} />
                      </div>
                      <p className="text-[10px] text-[#6B4D5A] mt-0.5 line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-bold text-[#D94A5A]">₹{item.price}</span>
                        <span className="text-[10px] text-[#6B4D5A] flex items-center gap-0.5">
                          <Clock size={10} /> {item.prepTime}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${item.inStock ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400 line-through'}`}>
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <AnimatePresence mode="wait">
                          {qty > 0 ? (
                            <motion.div
                              key="stepper"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => updateQuantity(item.id, qty - 1)}
                                className="w-7 h-7 rounded-full bg-card-elevated flex items-center justify-center"
                              >
                                <Minus size={14} className="text-white" />
                              </motion.button>
                              <motion.span
                                key={qty}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className="text-sm font-bold text-white w-5 text-center"
                              >
                                {qty}
                              </motion.span>
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => updateQuantity(item.id, qty + 1)}
                                className="w-7 h-7 rounded-full food-gradient flex items-center justify-center"
                              >
                                <Plus size={14} className="text-white" />
                              </motion.button>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="add"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => item.inStock && handleAdd(item)}
                              disabled={!item.inStock}
                              className="w-8 h-8 rounded-full food-gradient flex items-center justify-center disabled:opacity-40"
                            >
                              <Plus size={16} className="text-white" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom spacer for cart bar */}
        <div className="h-4" />
      </div>

      {/* Sticky Cart Bar - shows when items are added */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="flex-shrink-0 w-full z-40 px-3 pb-2"
          >
            <div
              className="w-full rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #1A0D12, #241014)',
                border: '1px solid rgba(217, 74, 90, 0.15)',
                boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(217, 74, 90, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag size={20} className="text-[#D94A5A]" />
                  <motion.span
                    key={cartItemCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full food-gradient text-[9px] font-bold text-white flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                </div>
                <div>
                  <p className="text-xs text-[#8A6A78]">{cartItemCount} item{cartItemCount > 1 ? 's' : ''} added</p>
                  <p className="text-lg font-bold text-[#D94A5A]">₹{canteenCartTotal}</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleViewCart}
                className="food-gradient text-white font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-glow-orange"
              >
                View Cart <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
