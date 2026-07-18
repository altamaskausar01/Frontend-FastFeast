import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useApp } from '@/hooks/useAppContext';
import { UtensilsCrossed } from 'lucide-react';
import { getMe } from '@/services/auth';

export default function SplashScreen() {
  const { dispatch, state, loginWithToken } = useApp();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (state.token) {
        try {
          const res = await getMe();
          const user = res.data.user;
          loginWithToken(state.token, {
            name: user.name,
            phone: user.phone,
            email: user.email,
          });
        } catch {
          // Token invalid, stay logged out
        }
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    const timer = setTimeout(() => {
      if (state.isOnboarded) {
        dispatch({ type: 'NAVIGATE', screen: state.isLoggedIn ? 'home' : 'login' });
      } else {
        dispatch({ type: 'NAVIGATE', screen: 'onboarding' });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [authChecked, state.isOnboarded, state.isLoggedIn]);

  return (
    <div className="screen-surface h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Red-to-blue ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E83F4D]/15 via-[#B8303E]/6 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#E83F4D]/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/4 w-[250px] h-[250px] rounded-full bg-[#1A1A2E]/8 blur-[80px] pointer-events-none" />

      {/* Orbiting food animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[200px] h-[200px] flex items-center justify-center"
      >
        {/* Center circle */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full food-gradient flex items-center justify-center shadow-glow-orange"
        >
          <UtensilsCrossed size={32} className="text-white" />
        </motion.div>
        {/* Orbiting items */}
        {['🍔', '🍕', '☕', '🍩'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.75,
            }}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
            }}
          >
            <span
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 90}deg) translateX(70px) translate(-50%, -50%)`,
              }}
            >
              {emoji}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="mt-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Fast <span className="text-[#FF6B35]">Feast</span>
        </h1>
      </motion.div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ delay: 0.9, duration: 2, repeat: Infinity }}
        className="mt-4 text-xs text-[#6B6B6B] font-medium tracking-wide"
      >
        Serving up deliciousness...
      </motion.p>
    </div>
  );
}
