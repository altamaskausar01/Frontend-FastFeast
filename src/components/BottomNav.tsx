import { motion } from 'framer-motion';
import { Home, ClipboardList, Gift, Users, User } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import type { TabName } from '@/types';

const tabs: { key: TabName; icon: React.ElementType; label: string }[] = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'orders', icon: ClipboardList, label: 'Orders' },
  { key: 'offers', icon: Gift, label: 'Offers' },
  { key: 'group', icon: Users, label: 'Group' },
  { key: 'profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();

  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
      className="flex-shrink-0 w-full z-50"
    >
      <div
        style={{
          background: 'rgba(10, 5, 9, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(217, 74, 90, 0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around sm:justify-center sm:gap-6 md:gap-10 lg:gap-16 h-14 px-2 md:px-4">
          {tabs.map((tab, index) => {
            const isActive = state.activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.key}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => dispatch({ type: 'SET_TAB', tab: tab.key })}
                className="flex flex-col items-center justify-center gap-1 w-14 sm:w-20 h-14 relative"
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 mx-auto w-10 h-10 rounded-xl"
                    style={{
                      background: 'rgba(217, 74, 90, 0.12)',
                      filter: 'blur(4px)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="relative"
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={isActive ? 'text-white' : 'text-[#6B4D5A]'}
                    style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(217, 74, 90, 0.5))' } : {}}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-[#6B4D5A]'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-0.5 w-6 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #D94A5A, #B83042)',
                      boxShadow: '0 0 8px rgba(217, 74, 90, 0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        <p className="h-5 flex items-center justify-center text-[9px] font-medium text-[#5A3D48] tracking-wider">
          © 2026 AKMH TEAM
        </p>
      </div>
    </motion.nav>
  );
}
