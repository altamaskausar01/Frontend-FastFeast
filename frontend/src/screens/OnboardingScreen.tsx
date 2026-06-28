import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppContext';
import { Clock, Users, Sparkles } from 'lucide-react';

const slides = [
  {
    icon: Clock,
    title: 'Skip the Queue',
    description: 'Order from your canteen and pick up when it\'s ready. No more waiting in long lines between classes.',
    color: '#FF6B35',
    gradient: 'from-orange-500/10 to-red-500/10',
  },
  {
    icon: Users,
    title: 'Order with Friends',
    description: 'Create a group order, share the link, and let everyone add their favorites. One person pays, everyone enjoys.',
    color: '#8B5CF6',
    gradient: 'from-purple-500/10 to-pink-500/10',
  },
  {
    icon: Sparkles,
    title: 'Smart Picks',
    description: 'Get personalized recommendations based on your taste, time of day, and what\'s trending on campus.',
    color: '#3B82F6',
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const { dispatch } = useApp();
  const [direction, setDirection] = useState(0);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const next = () => {
    if (current < slides.length - 1) {
      goTo(current + 1);
    } else {
      dispatch({ type: 'COMPLETE_ONBOARDING' });
    }
  };

  const skip = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="screen-surface h-full flex flex-col relative overflow-hidden">
      {/* Red-to-blue ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E83F4D]/12 via-[#B8303E]/5 to-transparent pointer-events-none" />
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-[#E83F4D]/8 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[10%] w-[200px] h-[200px] rounded-full bg-[#1A1A2E]/6 blur-[70px] pointer-events-none" />

      {/* Skip button */}
      <button
        onClick={skip}
        className="absolute top-4 right-4 z-10 text-sm text-[#A0A0A0] font-medium px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
      >
        Skip
      </button>

      {/* Carousel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction * 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
            className="w-full max-w-[320px]"
          >
            {/* Glass card */}
            <div
              className={`rounded-3xl p-8 bg-gradient-to-br ${slide.gradient} border border-white/[0.06] backdrop-blur-xl`}
            >
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: `${slide.color}20` }}
              >
                <Icon size={36} style={{ color: slide.color }} />
              </div>

              {/* Title */}
              <h2 className="mt-6 text-2xl font-bold text-white text-center tracking-tight">
                {slide.title}
              </h2>

              {/* Description */}
              <p className="mt-3 text-sm text-[#A0A0A0] text-center leading-relaxed">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative w-2 h-2 rounded-full transition-all duration-200"
            style={{
              background: i === current
                ? 'linear-gradient(135deg, #FF6B35, #FF3B3B)'
                : 'rgba(255, 255, 255, 0.2)',
              transform: i === current ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Get Started Button */}
      <div className="px-6 pb-10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="w-full h-14 rounded-full food-gradient text-white font-semibold text-base shadow-glow-orange"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={current === slides.length - 1 ? 'go' : 'next'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {current === slides.length - 1 ? "Let's Go! 🚀" : 'Continue'}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
