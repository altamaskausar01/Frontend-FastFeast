import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Star, Clock, Plus, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { getAllCanteens, normalizeCanteen } from '@/services/canteens';
import { getTrendingItems, getFastItems, type MenuItemDTO, normalizeMenuItem } from '@/services/menu';
import type { Canteen, MenuItem } from '@/types';

const filters = ['All', 'Veg', 'Fast', 'Popular', 'Under ₹100', 'Beverages'];

const RushDot = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  const colors = { low: '#10B981', medium: '#F59E0B', high: '#FF3B3B' };
  const labels = { low: 'Low Rush', medium: 'Medium Rush', high: 'High Rush' };
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: colors[level],
          boxShadow: `0 0 8px ${colors[level]}60`,
        }}
      />
      <span className="text-[10px] font-medium" style={{ color: colors[level] }}>
        {labels[level]}
      </span>
    </div>
  );
};

export default function HomeScreen() {
  const { navigate, dispatch, addToCart, showToast, state } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [trendingItems, setTrendingItems] = useState<MenuItem[]>([]);
  const [fastItems, setFastItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [canteensRes, trendingRes, fastRes] = await Promise.all([
          getAllCanteens(),
          getTrendingItems(5),
          getFastItems(6),
        ]);
        setCanteens(canteensRes.data.map(normalizeCanteen));
        setTrendingItems(trendingRes.data.map(normalizeMenuItem));
        setFastItems(fastRes.data.map(normalizeMenuItem));
      } catch {
        // Fallback to empty state
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = state.user.name.split(' ')[0];
    if (hour < 12) return `Good morning, ${name} ☀️`;
    if (hour < 17) return `Good afternoon, ${name} 👋`;
    if (hour < 21) return `Good evening, ${name} 🌙`;
    return `Late night cravings, ${name}? 🌃`;
  }, [state.user.name]);

  const handleCanteenTap = (id: string) => {
    dispatch({ type: 'SELECT_CANTEEN', id });
    navigate('canteenDetail', 'push');
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item.id, { ...item, quantity: 1 });
    showToast(`${item.name} added to cart!`);
  };

  return (
    <div className="screen-surface h-full overflow-y-auto no-scrollbar relative">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-4 px-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{greeting}</h1>
            <p className="text-sm text-[#A0A0A0] mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="w-11 h-11 rounded-full bg-card flex items-center justify-center relative"
          >
            <Bell size={20} className="text-[#A0A0A0]" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#FF3B3B]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-4 px-4"
      >
        <div className="h-12 rounded-full bg-card-elevated border border-white/[0.06] flex items-center px-4 gap-3 focus-within:border-[#FF6B35]/50 focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.15)] transition-all duration-200">
          <Search size={18} className="text-[#6B6B6B]" />
          <input
            type="text"
            placeholder="Search for food, canteens..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#6B6B6B] outline-none"
          />
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.25 }}
        className="mt-3 px-4"
      >
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === f
                  ? 'food-gradient text-white'
                  : 'bg-card border border-white/[0.08] text-[#A0A0A0]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Canteens Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="mt-6 px-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white tracking-tight">Canteens</h2>
          <button className="text-xs font-medium text-[#FF6B35] flex items-center gap-0.5">
            See All <ChevronRight size={14} />
          </button>
        </div>
        {loading ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="snap-start flex-shrink-0 w-[280px] h-[180px] rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {canteens.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCanteenTap(c.id)}
                className="snap-start flex-shrink-0 w-[280px] h-[180px] rounded-2xl overflow-hidden relative group"
              >
                <img src={c.bannerImage} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-white font-medium">{c.rating}</span>
                    </div>
                    <div className="flex gap-1">
                      {c.tags.map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/15 text-white/80">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <RushDot level={c.rushLevel} />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Trending Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="mt-6 px-4"
      >
        <div className="mb-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <TrendingUp size={18} className="text-[#FF6B35]" /> Trending Now
          </h2>
          <p className="text-[11px] text-[#6B6B6B] mt-0.5">What&apos;s hot on campus today</p>
        </div>
        <div className="flex flex-col gap-2">
          {trendingItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.3 }}
              className="bg-card rounded-2xl p-3 flex items-center gap-3"
            >
              <img src={item.image} alt={item.name} className="w-[72px] h-[72px] rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                <p className="text-[10px] text-[#6B6B6B] mt-0.5 truncate">{canteens.find(c => c.id === item.canteenId)?.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-bold text-[#FF6B35]">₹{item.price}</span>
                  <span className="text-[10px] text-[#6B6B6B] flex items-center gap-0.5">
                    <Clock size={10} /> {item.prepTime}
                  </span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleAddToCart(item)}
                className="w-9 h-9 rounded-full food-gradient flex items-center justify-center flex-shrink-0"
              >
                <Plus size={18} className="text-white" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fastest to Prepare */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="mt-6 px-4 pb-28"
      >
        <div className="mb-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Zap size={18} className="text-yellow-400" /> Fastest to Prepare
          </h2>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {fastItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 + i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAddToCart(item.id, item.name)}
              className="snap-start flex-shrink-0 w-[140px] bg-card rounded-xl overflow-hidden"
            >
              <img src={item.image} alt={item.name} className="w-full h-[100px] object-cover" />
              <div className="p-2">
                <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-[#FF6B35]">₹{item.price}</span>
                  <span className="text-[9px] text-[#6B6B6B] flex items-center gap-0.5">
                    <Clock size={9} /> {item.prepTime}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
