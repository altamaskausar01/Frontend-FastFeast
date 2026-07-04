import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Tag, Percent, Users, FileText, Eye, Edit3 } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { getAdminStats } from '@/services/users';
import { getAllCanteens, normalizeCanteen } from '@/services/canteens';
import type { Canteen } from '@/types';

export default function AdminScreen() {
  const { showToast } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalOrders: number;
    totalCanteens: number;
    totalRevenue: number;
  }>({ totalUsers: 0, totalOrders: 0, totalCanteens: 0, totalRevenue: 0 });
  const [canteens, setCanteens] = useState<Canteen[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsRes, canteensRes] = await Promise.all([
        getAdminStats(),
        getAllCanteens(),
      ]);
      setStats(statsRes.data.stats);
      setCanteens(canteensRes.data.map(normalizeCanteen));
    } catch {
      // Silent fallback
    }
  }

  const kpiData = [
    { key: 'totalOrders', label: 'Total Orders', value: stats.totalOrders.toLocaleString(), trend: '—', trendUp: null, icon: '📊' },
    { key: 'revenue', label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, trend: '—', trendUp: null, icon: '💰' },
    { key: 'activeCanteens', label: 'Active Canteens', value: stats.totalCanteens, trend: '— stable', trendUp: null, icon: '🏪' },
    { key: 'totalUsers', label: 'Total Users', value: stats.totalUsers.toLocaleString(), trend: '—', trendUp: null, icon: '👥' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => {
      setRefreshing(false);
      showToast('Data refreshed');
    }, 500);
  };

  const quickActions = [
    { icon: Tag, label: 'Manage Offers', desc: 'Create and edit offers' },
    { icon: Percent, label: 'Set Commission', desc: 'Configure canteen fees' },
    { icon: Users, label: 'User List', desc: 'View and manage users' },
    { icon: FileText, label: 'Reports', desc: 'Download analytics' },
  ];

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-[10px] text-[#6B6B6B]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleRefresh}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
        >
          <RefreshCw size={18} className={`text-[#A0A0A0] ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="px-4 grid grid-cols-2 gap-2">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{kpi.icon}</span>
              {kpi.trendUp !== null && (
                <span className={`flex items-center gap-0.5 text-[10px] ${kpi.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  {kpi.trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {kpi.trend}
                </span>
              )}
              {kpi.trendUp === null && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#6B6B6B]">
                  <Minus size={10} /> {kpi.trend}
                </span>
              )}
            </div>
            <motion.p
              key={refreshing ? `${kpi.key}-refresh` : kpi.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-white mt-1"
            >
              {kpi.value}
            </motion.p>
            <p className="text-[10px] text-[#6B6B6B] mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart - simplified since we don't have weekly data from API yet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mt-4 bg-card rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Revenue Overview</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-elevated text-[#A0A0A0]">Total</span>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#FF6B35]">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Total revenue from all orders</p>
          </div>
        </div>
      </motion.div>

      {/* Canteens Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-4 mt-4 bg-card rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-sm font-semibold text-white">Canteens</h3>
          <button className="text-[10px] text-[#FF6B35] font-medium">Manage</button>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {canteens.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className="flex items-center px-4 py-3 hover:bg-card-highlight transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{c.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.rushLevel === 'high' ? '#FF3B3B' : '#10B981' }}
                  />
                  <span className="text-[10px] text-[#6B6B6B]">
                    {c.rushLevel === 'high' ? 'High load' : 'Operating'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A0A0A0]">{c.ratingCount} ratings</span>
                <button className="w-7 h-7 rounded-lg bg-card-elevated flex items-center justify-center">
                  <Eye size={12} className="text-[#6B6B6B]" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-card-elevated flex items-center justify-center">
                  <Edit3 size={12} className="text-[#6B6B6B]" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-4 mt-4"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + i * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => showToast(`${action.label} - Coming soon!`)}
                className="bg-card rounded-xl p-4 text-left hover:bg-card-highlight transition-colors"
              >
                <Icon size={20} className="text-[#FF6B35]" />
                <p className="text-xs font-semibold text-white mt-2">{action.label}</p>
                <p className="text-[10px] text-[#6B6B6B] mt-0.5">{action.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Activity Feed placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mx-4 mt-4 mb-8 bg-card rounded-2xl p-4"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
        <p className="text-xs text-[#6B6B6B] text-center py-6">
          Activity feed coming soon with WebSocket integration
        </p>
      </motion.div>
    </div>
  );
}
