import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, Plus, Lock, Crown, UtensilsCrossed } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { groupParticipants } from '@/data/mockData';

export default function GroupOrderScreen() {
  const { navigate, showToast, state } = useApp();
  const [hasGroup, setHasGroup] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const firstName = state.user.name.split(' ')[0] || 'You';
  const inviteSlug = firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'fast-feast';
  const participants = groupParticipants.map((participant) =>
    participant.isHost
      ? { ...participant, name: firstName, avatar: firstName[0]?.toUpperCase() || 'Y' }
      : participant
  );
  const [sharedItems] = useState([
    { id: 'gi1', name: 'Cheese Burger', qty: 2, price: 120, addedBy: firstName, avatar: firstName[0]?.toUpperCase() || 'Y', color: 'from-orange-500 to-red-500' },
    { id: 'gi2', name: 'Fries', qty: 1, price: 60, addedBy: 'Aisha', avatar: 'A', color: 'from-pink-500 to-rose-500' },
    { id: 'gi3', name: 'Cold Coffee', qty: 2, price: 80, addedBy: 'Rohan', avatar: 'R', color: 'from-blue-500 to-cyan-500' },
    { id: 'gi4', name: 'Chocolate Brownie', qty: 1, price: 90, addedBy: 'Priya', avatar: 'P', color: 'from-purple-500 to-violet-500' },
  ]);
  const [liveActivity] = useState<string | null>(null);

  const total = sharedItems.reduce((s, i) => s + i.price * i.qty, 0);

  const handleCopyLink = () => {
    setCopied(true);
    showToast('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLockOrder = () => {
    setIsLocked(true);
    showToast('Order locked! Proceeding to payment...');
    setTimeout(() => navigate('payment', 'push'), 1000);
  };

  if (!hasGroup) {
    return (
      <div className="screen-surface h-full flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 rounded-full purple-gradient/20 flex items-center justify-center"
        >
          <Users size={48} className="text-[#8B5CF6]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mt-6 text-center">Order with Friends!</h2>
        <p className="text-sm text-[#A0A0A0] text-center mt-2 leading-relaxed">
          Create a group, share the link, and let everyone add their favorites.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setHasGroup(true)}
          className="w-full h-14 rounded-full food-gradient text-white font-semibold mt-8 shadow-glow-orange"
        >
          Start Group Order
        </motion.button>
      </div>
    );
  }

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="pt-4 px-4 md:px-6 lg:px-8 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Group Order</h1>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">Live</span>
          </div>
        </div>
        <p className="text-xs text-[#A0A0A0] mt-0.5">Main Canteen • {participants.length} people ordering</p>
      </div>

      {/* Invite Link */}
      <div className="mx-4 md:mx-6 lg:mx-8 bg-card rounded-2xl p-3 flex items-center gap-2">
        <div className="flex-1 bg-card-elevated rounded-xl px-3 py-2">
          <p className="text-[10px] text-[#6B6B6B] truncate">fastfeast.app/g/{inviteSlug}-group-42</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleCopyLink}
          className="px-3 py-2 rounded-xl food-gradient text-white text-xs font-medium flex items-center gap-1"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
      </div>

      {/* Participant Avatars */}
      <div className="px-4 md:px-6 lg:px-8 mt-4">
        <div className="flex items-center">
          {participants.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 400, damping: 20 }}
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold border-2 border-[#0F0F0F] ${i > 0 ? '-ml-2' : ''} relative`}
            >
              {p.avatar}
              {p.isHost && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-page flex items-center justify-center">
                  <Crown size={8} className="text-yellow-400" />
                </div>
              )}
            </motion.div>
          ))}
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center -ml-2"
          >
            <Plus size={16} className="text-[#6B6B6B]" />
          </motion.button>
        </div>
      </div>

      {/* Add Items Button */}
      <div className="px-4 md:px-6 lg:px-8 mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('canteenDetail', 'push')}
          disabled={isLocked}
          className="w-full h-12 rounded-xl bg-card border border-dashed border-white/15 flex items-center justify-center gap-2 text-sm text-[#A0A0A0] disabled:opacity-40"
        >
          <UtensilsCrossed size={16} />
          {isLocked ? 'Order is locked' : 'Add Items'}
        </motion.button>
      </div>

      {/* Live Activity Toast */}
      <AnimatePresence>
        {liveActivity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-3 bg-card-elevated rounded-xl px-3 py-2 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-xs text-[#A0A0A0]">{liveActivity}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Cart */}
      <div className="px-4 md:px-6 lg:px-8 mt-4 flex-1">
        <h3 className="text-sm font-semibold text-white mb-2">Shared Cart</h3>
        <div className="space-y-2">
          <AnimatePresence>
            {sharedItems.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-3 flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-[#6B6B6B]">Added by {item.addedBy}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#6B6B6B]">x{item.qty}</p>
                  <p className="text-sm font-bold text-[#FF6B35]">₹{item.price * item.qty}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Total */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between items-center">
          <span className="text-sm text-[#A0A0A0]">Total ({sharedItems.reduce((s, i) => s + i.qty, 0)} items)</span>
          <span className="text-xl font-bold text-[#FF6B35]">₹{total}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 md:px-6 lg:px-8 pb-8 pt-4 space-y-2 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLockOrder}
          disabled={isLocked || sharedItems.length === 0}
          className="w-full h-14 rounded-full food-gradient text-white font-semibold shadow-glow-orange disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Lock size={18} />
          Lock Order & Pay ₹{total}
        </motion.button>
        <button
          className="w-full h-10 text-sm font-medium text-red-400/70 hover:text-red-400 transition-colors"
        >
          Leave Group
        </button>
      </div>
    </div>
  );
}
