import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Bell, Moon, CreditCard, MapPin, Globe, HelpCircle, Info, LogOut, Pencil, ChevronRight } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { getUserProfile } from '@/services/users';

interface ToggleItem {
  icon: React.ElementType;
  label: string;
  hasToggle: true;
  defaultOn: boolean;
  disabled?: boolean;
}

interface ChevronItem {
  icon: React.ElementType;
  label: string;
  hasChevron: true;
  value?: string;
}

interface ValueItem {
  icon: React.ElementType;
  label: string;
  value: string;
}

type SettingItem = ToggleItem | ChevronItem | ValueItem;

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

const settingsGroups: SettingGroup[] = [
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', hasToggle: true, defaultOn: true },
      { icon: Moon, label: 'Dark Mode', hasToggle: true, defaultOn: true, disabled: true },
    ] as SettingItem[],
  },
  {
    title: 'Account',
    items: [
      { icon: CreditCard, label: 'Payment Methods', hasChevron: true },
      { icon: MapPin, label: 'Addresses', hasChevron: true },
      { icon: Globe, label: 'Language', value: 'English', hasChevron: true },
    ] as SettingItem[],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', hasChevron: true },
      { icon: Info, label: 'About', value: 'v1.0.0' },
    ] as SettingItem[],
  },
];

export default function ProfileScreen() {
  const { state, logout, showToast, dispatch } = useApp();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Notifications': true,
    'Dark Mode': true,
  });

  useEffect(() => {
    // Refresh user profile on mount
    async function refreshProfile() {
      try {
        const res = await getUserProfile();
        const { user, stats } = res.data;
        dispatch({
          type: 'SET_USER',
          user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletBalance: user.walletBalance,
            streakDays: user.streakDays,
            totalOrders: stats.totalOrders,
            totalSaved: stats.totalSaved,
          },
        });
      } catch {
        // Silent fallback
      }
    }
    refreshProfile();
  }, []);

  const handleToggle = (label: string) => {
    if (label === 'Dark Mode') return;
    setToggles(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully');
  };

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="pt-4 px-4 pb-3">
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center px-4"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full food-gradient p-[3px]">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {state.user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-card-elevated flex items-center justify-center border border-white/10">
            <Pencil size={10} className="text-[#A0A0A0]" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-white mt-3">{state.user.name}</h2>
        <p className="text-sm text-[#A0A0A0]">{state.user.phone}</p>
        <button className="text-xs text-[#FF6B35] font-medium mt-1">Edit Profile</button>
      </motion.div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mt-5 glass-card p-4 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl purple-gradient flex items-center justify-center">
          <Wallet size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-[#A0A0A0]">Wallet Balance</p>
          <p className="text-2xl font-bold text-[#FF6B35]">₹{state.user.walletBalance}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="px-4 py-2 rounded-full food-gradient text-white text-xs font-semibold"
        >
          + Add
        </motion.button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 mt-4 grid grid-cols-3 gap-2.5"
      >
        {[
          { label: 'Orders', value: String(state.user.totalOrders), sub: 'total', color: 'text-white' },
          { label: 'Saved', value: `₹${state.user.totalSaved}`, sub: 'with offers', color: 'text-[#FF6B35]' },
          { label: 'Streak', value: `${state.user.streakDays} days`, sub: 'current', color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 + i * 0.1 }}
            className="bg-card rounded-2xl p-3 text-center"
          >
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-[#6B6B6B] mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Settings */}
      <div className="px-4 mt-6 pb-8">
        {settingsGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + gi * 0.1 }}
            className="mb-5"
          >
            <p className="text-[10px] text-[#6B6B6B] uppercase tracking-widest mb-2 px-1">{group.title}</p>
            <div className="bg-card rounded-2xl overflow-hidden">
              {group.items.map((item, ii) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + gi * 0.1 + ii * 0.05 }}
                    onClick={() => !('hasToggle' in item) && showToast(`${item.label} - Coming soon!`)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-card-highlight ${
                      ii < group.items.length - 1 ? 'border-b border-white/[0.04]' : ''
                    }`}
                  >
                    <Icon size={18} className="text-[#A0A0A0] flex-shrink-0" />
                    <span className="flex-1 text-sm text-white">{item.label}</span>
                    {('value' in item) && !('hasToggle' in item) && !('hasChevron' in item) && (
                      <span className="text-xs text-[#6B6B6B]">{(item as ValueItem).value}</span>
                    )}
                    {('hasToggle' in item) && (item as ToggleItem).hasToggle && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggle(item.label); }}
                        disabled={'disabled' in item ? (item as ToggleItem).disabled : false}
                        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                          toggles[item.label] ? 'food-gradient' : 'bg-card-elevated'
                        } ${'disabled' in item && (item as ToggleItem).disabled ? 'opacity-50' : ''}`}
                      >
                        <motion.div
                          animate={{ x: toggles[item.label] ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                        />
                      </button>
                    )}
                    {('hasChevron' in item) && (item as ChevronItem).hasChevron && <ChevronRight size={16} className="text-[#6B6B6B]" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl bg-card text-red-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-card-highlight transition-colors"
        >
          <LogOut size={16} />
          Logout
        </motion.button>
      </div>
    </div>
  );
}
