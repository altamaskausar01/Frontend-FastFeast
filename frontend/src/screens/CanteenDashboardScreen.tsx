import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, UtensilsCrossed } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { dashboardOrders } from '@/data/mockData';
import type { DashboardOrder } from '@/types';

type OrderStatus = 'new' | 'preparing' | 'ready';

const tabs: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'all', label: 'All' },
];

export default function CanteenDashboardScreen() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('new');
  const [orders, setOrders] = useState(dashboardOrders);
  const [isPaused, setIsPaused] = useState(false);

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);
  const stats = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    today: 47,
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order ${orders.find(o => o.id === orderId)?.token} updated`);
  };

  const getActions = (order: DashboardOrder) => {
    if (order.status === 'new') {
      return (
        <>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            disabled={isPaused}
            className="px-3 py-1.5 rounded-full green-gradient text-white text-[10px] font-semibold disabled:opacity-40"
          >
            Accept
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-semibold"
          >
            Reject
          </motion.button>
        </>
      );
    }
    if (order.status === 'preparing') {
      return (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => updateOrderStatus(order.id, 'ready')}
          className="px-3 py-1.5 rounded-full food-gradient text-white text-[10px] font-semibold"
        >
          Mark Ready
        </motion.button>
      );
    }
    return (
      <span className="px-3 py-1.5 rounded-full green-gradient/30 text-green-400 text-[10px] font-semibold flex items-center gap-1">
        <Check size={10} /> Ready
      </span>
    );
  };

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h1 className="text-xl font-bold text-white">Canteen Panel</h1>
          <p className="text-[10px] text-[#6B6B6B]">Main Canteen</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-400">Live</span>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 grid grid-cols-4 gap-2"
      >
        {[
          { key: 'new', label: 'New', color: 'text-[#FF6B35]' },
          { key: 'preparing', label: 'Preparing', color: 'text-amber-400' },
          { key: 'ready', label: 'Ready', color: 'text-green-400' },
          { key: 'today', label: 'Today', color: 'text-white' },
        ].map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-2.5 text-center"
          >
            <motion.p
              key={stats[s.key as keyof typeof stats]}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className={`text-xl font-bold ${s.color}`}
            >
              {stats[s.key as keyof typeof stats]}
            </motion.p>
            <p className="text-[9px] text-[#6B6B6B] mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Peak Load */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#6B6B6B]">Load</span>
          <span className="text-[10px] text-amber-400">65% — Busy</span>
        </div>
        <div className="h-2 bg-card-elevated rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #10B981, #F59E0B, #FF3B3B)' }}
          />
        </div>
      </div>

      {/* Pause Toggle */}
      <div className="px-4 mt-3 flex items-center justify-between bg-card rounded-xl p-3">
        <span className="text-sm text-white font-medium">Pause New Orders</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPaused(!isPaused)}
          className={`relative w-12 h-7 rounded-full transition-colors ${isPaused ? 'bg-red-500' : 'bg-card-elevated'}`}
        >
          <motion.div
            animate={{ x: isPaused ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
          />
        </motion.button>
      </div>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-4 mt-2 bg-red-500/10 rounded-xl px-3 py-2"
        >
          <p className="text-[10px] text-red-400">Orders are paused. Customers cannot place new orders.</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === tab.key ? 'food-gradient text-white' : 'bg-card text-[#A0A0A0]'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1 text-[9px] opacity-70">({stats[tab.key]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="px-4 mt-3 pb-6 space-y-2">
        <AnimatePresence mode="wait">
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#FF6B35]">{order.token}</span>
                  <span className="text-[10px] text-[#6B6B6B]">{order.timeAgo}</span>
                </div>
                {order.orderType === 'group' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full purple-gradient text-white">Group</span>
                )}
              </div>

              <div className="mt-2 space-y-0.5">
                {order.items.map((item, ii) => (
                  <p key={ii} className="text-xs text-[#A0A0A0]">{item.name} x{item.qty}</p>
                ))}
              </div>

              {order.notes && (
                <p className="text-[10px] text-amber-400 mt-1.5">Note: {order.notes}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-white">₹{order.total}</span>
                <div className="flex gap-2">
                  {getActions(order)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Manage Menu Link */}
      <div className="px-4 pb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => showToast('Menu management - Coming soon!')}
          className="w-full h-12 rounded-2xl bg-card border border-white/[0.08] text-[#A0A0A0] font-medium text-sm flex items-center justify-center gap-2"
        >
          <UtensilsCrossed size={16} />
          Manage Menu & Items
        </motion.button>
      </div>
    </div>
  );
}
