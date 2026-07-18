import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Gift, Copy, Check, Sparkles } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { getOffers, normalizeOffer } from '@/services/offers';
import { getCoupons, type CouponDTO } from '@/services/offers';
import type { Offer } from '@/types';
import confetti from 'canvas-confetti';

export default function OffersScreen() {
  const { state, showToast } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<CouponDTO[]>([]);
  const [claimedOffers, setClaimedOffers] = useState<Set<string>>(new Set());
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [mysteryOpened, setMysteryOpened] = useState(false);
  const [mysteryReward, setMysteryReward] = useState<{ name: string; amount: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [offersRes, couponsRes] = await Promise.all([
          getOffers(),
          getCoupons(),
        ]);
        setOffers(offersRes.data.map(normalizeOffer));
        setCoupons(couponsRes.data);
      } catch {
        // Silent fallback
      }
    }
    loadData();
  }, []);

  const handleClaimOffer = (offerId: string) => {
    setClaimedOffers(prev => new Set(prev).add(offerId));
    showToast('Deal claimed! Applied at checkout.');
  };

  const handleCopyCoupon = (code: string) => {
    setCopiedCoupon(code);
    showToast('Coupon code copied!');
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleOpenMystery = () => {
    const rewards = [
      { name: '₹20 Cashback!', amount: 'Applied to your next order' },
      { name: 'Free Fries!', amount: 'With any burger order' },
      { name: '15% Off!', amount: 'Valid for today only' },
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    setMysteryReward(reward);
    setMysteryOpened(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FF6B35', '#8B5CF6', '#10B981'],
    });
  };

  const streakProgress = (state.user.streakDays / 10) * 100;

  return (
    <div className="screen-surface h-full flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="pt-4 px-4 md:px-6 lg:px-8 pb-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Offers & Rewards</h1>
      </div>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 md:mx-6 lg:mx-8 rounded-3xl p-5 md:p-6 border border-amber-500/20"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.04))' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [-1, 3, -1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame size={32} className="text-amber-500" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-white">{state.user.streakDays} Day Streak! 🔥</h2>
            <p className="text-xs text-[#A0A0A0] mt-0.5">You&apos;re on fire! Keep ordering to earn rewards.</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-card-elevated rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${streakProgress}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full gold-gradient rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#6B6B6B]">{state.user.streakDays}/10 days</span>
            <span className="text-[10px] text-amber-400">Order {10 - state.user.streakDays} more days to unlock ₹50 cashback</span>
          </div>
        </div>
      </motion.div>

      {/* Daily Deals */}
      <div className="px-4 md:px-6 lg:px-8 mt-6">
        <h3 className="text-sm md:text-base font-semibold text-white mb-3 flex items-center gap-1.5">
          <Flame size={14} className="text-[#D94A5A]" /> Today&apos;s Deals
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`snap-start flex-shrink-0 w-[230px] xs:w-[260px] sm:w-[280px] h-[150px] xs:h-[160px] rounded-2xl p-4 bg-gradient-to-br ${offer.gradient} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-3xl font-extrabold text-white">{offer.discount}</p>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">{offer.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">Valid till {offer.validUntil}</span>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleClaimOffer(offer.id)}
                    disabled={claimedOffers.has(offer.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      claimedOffers.has(offer.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    {claimedOffers.has(offer.id) ? 'Claimed ✓' : 'Claim'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mystery Reward */}
      <div className="px-4 md:px-6 lg:px-8 mt-6">
        <h3 className="text-sm md:text-base font-semibold text-white mb-3 flex items-center gap-1.5">
          <Gift size={14} className="text-purple-400" /> Mystery Reward
        </h3>
        <div className="bg-card rounded-2xl p-6 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {!mysteryOpened ? (
              <motion.div
                key="box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.4 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-3"
                >
                  🎁
                </motion.div>
                <h4 className="text-lg font-bold text-white">Mystery Reward</h4>
                <p className="text-xs text-[#A0A0A0] mt-1 mb-4">Open to reveal your surprise!</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenMystery}
                  className="px-8 py-2.5 rounded-full food-gradient text-white font-semibold text-sm shadow-glow-orange"
                >
                  Open
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="reward"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                  className="text-6xl mb-3"
                >
                  ✨
                </motion.div>
                <h4 className="text-xl font-bold text-[#D94A5A]">{mysteryReward?.name}</h4>
                <p className="text-xs text-[#A0A0A0] mt-1">{mysteryReward?.amount}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-6 py-2 rounded-full green-gradient text-white text-sm font-medium"
                >
                  Claim Reward
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Coupons */}
      <div className="px-4 md:px-6 lg:px-8 mt-6 pb-6">
        <h3 className="text-sm md:text-base font-semibold text-white mb-3 flex items-center gap-1.5">
          <Sparkles size={14} className="text-yellow-400" /> Available Coupons
        </h3>
        <div className="space-y-2">
          {coupons.map((coupon, i) => (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="bg-card rounded-2xl p-4 flex items-center gap-3 border-l-2 border-dashed border-l-[#D94A5A]/40"
            >
              <div className="flex-1">
                <p className="text-lg font-bold text-[#D94A5A]">{coupon.discount}</p>
                <p className="text-xs text-[#A0A0A0]">{coupon.description}</p>
                <div className="mt-1.5 inline-flex px-2 py-0.5 rounded bg-card-elevated">
                  <span className="text-[10px] text-[#A0A0A0] font-mono">{coupon.code}</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCopyCoupon(coupon.code)}
                className="px-3 py-1.5 rounded-full bg-card-elevated text-[#D94A5A] text-xs font-medium flex items-center gap-1"
              >
                {copiedCoupon === coupon.code ? <Check size={12} /> : <Copy size={12} />}
                {copiedCoupon === coupon.code ? 'Copied' : 'Copy'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
