import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from '@/hooks/useAppContext';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import StickyCartBar from '@/components/StickyCartBar';
import GeminiAssistant from '@/components/GeminiAssistant';
import SplashScreen from '@/screens/SplashScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import LoginScreen from '@/screens/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import CanteenDetailScreen from '@/screens/CanteenDetailScreen';
import CartScreen from '@/screens/CartScreen';
import PaymentScreen from '@/screens/PaymentScreen';
import OrderSuccessScreen from '@/screens/OrderSuccessScreen';
import OrderTrackingScreen from '@/screens/OrderTrackingScreen';
import OrdersScreen from '@/screens/OrdersScreen';
import GroupOrderScreen from '@/screens/GroupOrderScreen';
import OffersScreen from '@/screens/OffersScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import CanteenDashboardScreen from '@/screens/CanteenDashboardScreen';
import AdminScreen from '@/screens/AdminScreen';

const tabRoots: string[] = ['home', 'orders', 'offers', 'groupOrder', 'profile'];

function ScreenRouter() {
  const { state } = useApp();

  const variants = {
    enter: (direction: string) => ({
      x: direction === 'push' ? '100%' : direction === 'pop' ? '-30%' : 0,
      y: direction === 'modal' ? '100%' : 0,
      opacity: direction === 'modal' ? 1 : 0.8,
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'push' ? '-30%' : direction === 'pop' ? '100%' : 0,
      y: 0,
      opacity: direction === 'modal' ? 1 : 0.5,
    }),
  };

  const renderScreen = () => {
    switch (state.screen) {
      case 'splash': return <SplashScreen />;
      case 'onboarding': return <OnboardingScreen />;
      case 'login': return <LoginScreen />;
      case 'home': return <HomeScreen />;
      case 'canteenDetail': return <CanteenDetailScreen />;
      case 'cart': return <CartScreen />;
      case 'payment': return <PaymentScreen />;
      case 'orderSuccess': return <OrderSuccessScreen />;
      case 'orderTracking': return <OrderTrackingScreen />;
      case 'orders': return <OrdersScreen />;
      case 'groupOrder': return <GroupOrderScreen />;
      case 'offers': return <OffersScreen />;
      case 'profile': return <ProfileScreen />;
      case 'canteenDashboard': return <CanteenDashboardScreen />;
      case 'admin': return <AdminScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait" custom={state.navDirection}>
      <motion.div
        key={state.screen}
        custom={state.navDirection}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: 'tween', duration: 0.3, ease: [0.65, 0, 0.35, 1] },
          y: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="h-full w-full responsive-screen"
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const { state } = useApp();

  const showNav = tabRoots.includes(state.screen);
  const showCartBar = tabRoots.includes(state.screen) && state.screen !== 'cart';

  return (
    <div className="min-h-[100dvh] w-full bg-[#100B0E] flex justify-center items-stretch p-0 md:p-4">
      {/* Responsive app container */}
      <div className="food-theme-bg w-full h-[100dvh] md:h-[calc(100dvh-2rem)] md:max-w-[1120px] lg:max-w-[1024px] xl:max-w-[1280px] rounded-none md:rounded-2xl overflow-hidden shadow-2xl relative isolate flex flex-col"
        style={{ boxShadow: '0 0 0 1px rgba(232, 63, 77, 0.08), 0 0 60px rgba(232, 63, 77, 0.04), 0 25px 80px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Main content area */}
        <main className="flex-1 overflow-hidden relative">
          <ScreenRouter />
        </main>

        {/* Sticky Cart Bar */}
        {showCartBar && <StickyCartBar />}

        {/* Bottom Navigation */}
        {showNav && <BottomNav />}

        {/* Toast Notifications */}
        <Toast />

        {/* Gemini Food Assistant - only on home screen, fixed below nav */}
        {state.screen === 'home' && <GeminiAssistant />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
