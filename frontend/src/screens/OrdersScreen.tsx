import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { getOrders, normalizeOrder, type OrderDTO } from '@/services/orders';
import type { Order } from '@/types';

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/15', label: 'Completed' },
  ready: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/15', label: 'Ready' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15', label: 'Cancelled' },
  received: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'Received' },
  preparing: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Preparing' },
};

export default function OrdersScreen() {
  const { state, navigate, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('past');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await getOrders();
        const orders: Order[] = res.data.map(normalizeOrder);
        dispatch({ type: 'SET_ORDERS', orders });
      } catch {
        // Silent fallback
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const allOrders = state.orders;
  const activeOrders = allOrders.filter(o => o.status === 'received' || o.status === 'preparing' || o.status === 'ready');
  const pastOrdersList = allOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');
  const displayOrders = activeTab === 'active' ? activeOrders : pastOrdersList;

  const handleReorder = (orderId: string) => {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
      dispatch({ type: 'REORDER', order });
      showToast('Items added to cart!');
      navigate('cart', 'modal');
    }
  };

  const handleTrack = (orderId: string) => {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
      dispatch({ type: 'SET_ACTIVE_ORDER', orderId, token: order.token });
      navigate('orderTracking', 'push');
    }
  };

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="pt-4 px-4 pb-3">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Orders</h1>
      </div>

      {/* Active Order Banner */}
      {activeOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 bg-card rounded-2xl p-4 border-2 border-transparent"
          style={{ borderImage: 'linear-gradient(135deg, #FF6B35, #FF3B3B) 1', borderRadius: '16px' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#A0A0A0]">Active Order</p>
              <p className="text-2xl font-extrabold text-[#FF6B35] text-shadow-token">{activeOrders[0].token}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mt-1 ${statusConfig[activeOrders[0].status].bg} ${statusConfig[activeOrders[0].status].color}`}>
                {(() => { const S = statusConfig[activeOrders[0].status].icon; return <S size={10} />; })()}
                {statusConfig[activeOrders[0].status].label}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTrack(activeOrders[0].id)}
              className="px-4 py-2 rounded-full food-gradient text-white text-xs font-semibold"
            >
              Track →
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          {(['active', 'past'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? 'food-gradient text-white' : 'bg-card text-[#A0A0A0]'
              }`}
            >
              {tab === 'active' ? 'Active' : 'Past'} ({tab === 'active' ? activeOrders.length : pastOrdersList.length})
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-24 space-y-2"
        >
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#6B6B6B] text-sm">Loading orders...</p>
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B6B6B] text-sm">No {activeTab} orders</p>
            </div>
          ) : (
            displayOrders.map((order, i) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.completed;
              const isExpanded = expandedOrder === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{order.canteenName}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B6B6B] mt-0.5">
                        {order.items.map(it => it.name).join(', ').slice(0, 40)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-bold text-[#FF6B35]">₹{order.finalTotal}</span>
                        <span className="text-[10px] text-[#6B6B6B]">{order.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {order.status === 'completed' && (
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleReorder(order.id)}
                          disabled={reordering === order.id}
                          className="px-3 py-1.5 rounded-full food-gradient text-white text-[10px] font-medium flex items-center gap-1"
                        >
                          {reordering === order.id ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            <RefreshCw size={10} />
                          )}
                          Reorder
                        </motion.button>
                      )}
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="text-[#6B6B6B]"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-white/[0.06]">
                          <p className="text-[10px] text-[#A0A0A0] mb-1">Token: <span className="text-white font-bold">{order.token}</span></p>
                          <div className="space-y-1">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-xs">
                                <span className="text-[#A0A0A0]">{item.name} x{item.quantity}</span>
                                <span className="text-white">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-[#6B6B6B]">GST</span>
                              <span className="text-[#A0A0A0]">₹{order.gst}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-[#6B6B6B]">Platform Fee</span>
                              <span className="text-[#A0A0A0]">₹{order.platformFee}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-[10px]">
                                <span className="text-[#6B6B6B]">Discount</span>
                                <span className="text-green-400">-₹{order.discount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-bold pt-1">
                              <span className="text-white">Total</span>
                              <span className="text-[#FF6B35]">₹{order.finalTotal}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
