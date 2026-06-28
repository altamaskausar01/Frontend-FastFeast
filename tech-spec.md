# Fast Feast — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0 | UI framework |
| react-dom | ^19.0 | DOM rendering |
| react-router-dom | ^7.0 | Client-side routing (HashRouter) |
| tailwindcss | ^4.0 | Utility-first CSS |
| @tailwindcss/vite | ^4.0 | Tailwind Vite integration |
| framer-motion | ^12.0 | Animations, transitions, spring physics, AnimatePresence |
| lucide-react | ^0.500 | Icon library (Home, ClipboardList, Gift, Users, User, Bell, Star, Clock, Search, ArrowLeft, Plus, Minus, ChevronRight, Check, CheckCircle, AlertTriangle, XCircle, ChefHat, PackageCheck, RefreshCw, Crown, Phone, CreditCard, MapPin, Globe, HelpCircle, Info, Pencil, Moon, Trash2, Eye, FileText, Tag, Percent, Settings, BarChart3, Flame, X, RotateCcw, Utensils, Crosshair, Wallet, Store, Radio) |
| canvas-confetti | ^1.9 | Order success / reward celebration confetti |
| react-countup | ^6.5 | Animated number counters (KPI stats, token, queue) |
| qrcode.react | ^4.0 | QR code generation for token screen |

**Dev:**
| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.0 | Build tool |
| @vitejs/plugin-react | ^4.0 | React Vite plugin |
| typescript | ^5.7 | Type safety |
| @types/react | ^19.0 | React type definitions |
| @types/react-dom | ^19.0 | React DOM type definitions |
| @types/canvas-confetti | ^1.9 | Confetti type definitions |

---

## Component Inventory

### Layout

| Component | Source | Notes |
|-----------|--------|-------|
| AppShell | Custom | Responsive phone-to-desktop container, page-level scroll management, shared background |
| BottomNav | Custom | 5-tab bar (Home, Orders, Offers, Group, Profile) with glassmorphic backdrop-blur. Active spring-scale animation. Collapses on CanteenDetail, Cart, Payment, OrderSuccess, OrderTracking, CanteenDashboard, AdminPanel. |
| StickyCartBar | Custom | Conditionally rendered above BottomNav. Slides up/down based on cart non-emptiness. Shows item count + total + "View Cart" CTA. |
| Header | Custom | Context-aware: transparent on Home (becomes glassmorphic on scroll > 60px), always glassmorphic on other screens. Transitions between states on scroll via `useScroll` hook from framer-motion. |

### Shared / Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| GlassCard | Custom | ~all screens — semi-transparent card with backdrop-blur, hover border/shadow transition |
| PrimaryButton | Custom | ~all screens — gradient pill button with ripple tap effect, spring press, loading spinner state |
| SecondaryButton | Custom | ~10 screens — outlined pill button with hover fill |
| IconButton | Custom | ~all screens — 44px circle, tap spring feedback |
| SearchBar | Custom | Home, CanteenDetail — focus gradient glow, debounced onChange callback |
| FilterPill | Custom | Home, CanteenDetail, OrdersHistory, CanteenDashboard — active gradient/inactive toggle |
| QuantityStepper | Custom | CanteenDetail, Cart — long-press continuous increment via `setInterval` |
| FoodItemCard | Custom | Home (Trending + Fastest), CanteenDetail — image + meta + add-to-cart / stepper toggle |
| CanteenCard | Custom | Home — banner image with gradient overlay, rush indicator, hover lift |
| Toast | Custom | Global — 3-type (success/warning/error), auto-dismiss, swipe-to-dismiss, imperative API via context |
| SkeletonLoader | Custom | Home, CanteenDetail, OrdersHistory — shimmer gradient sweep via CSS animation |
| AnimatedProgressRing | Custom | OrderTracking, Offers — SVG stroke-dashoffset tween |

### Page Sections (by Screen)

| Screen | Key Sections |
|--------|-------------|
| Splash | LottieLoader (custom CSS animation fallback), LogoWordmark, loading text pulse |
| Onboarding | SwipeableCarousel (touch gestures + snap), OnboardingCard x3, DotIndicators, GetStartedButton |
| Home | Greeting (time-of-day logic), FloatingFoodParticles (ambient background), CanteenCarousel (scroll-snap), TrendingList, FastestPrepRow |
| CanteenDetail | ParallaxBanner, CategoryTabs (sticky, spring underline), MenuListByCategory |
| Cart | CartItemCard (swipe-to-delete + customize accordion), SuggestedCombosRow, BillBreakdownCard |
| Payment | PaymentMethodCard x5, UPIAppsGrid, WalletTopupBanner, PayButton (multi-state: idle/loading/success) |
| OrderSuccess | TokenSpinner3D (CSS perspective cylinder), QRCodeDisplay, ConfettiTrigger |
| OrderTracking | StatusTimeline (3-step vertical with animated connectors), TypewriterText, QueuePositionBar |
| OrdersHistory | ActiveOrderBanner (pulse glow), OrderTabs, OrderCard (expandable accordion), ReorderButton |
| GroupOrder | ParticipantAvatarRow (overlapping circles), SharedCartItem, LiveActivityIndicator, LockAndPayFlow |
| OffersRewards | StreakCard (animated flame + progress), DailyDealsCarousel, MysteryRewardBox (shake→burst→reveal), CouponCard |
| Profile | ProfileHeader (avatar + edit), WalletCard, StatsRow, SettingsGroup (toggle rows) |
| CanteenDashboard | StatsCounterRow, PeakLoadBar, PauseOrdersToggle, DashboardOrderCard (contextual actions per status), NewOrderArrival animation |
| AdminPanel | KPICardsRow, RevenueBarChart (SVG/CSS), CanteensTable, QuickActionsGrid, ActivityFeed |

### Hooks

| Hook | Purpose |
|------|---------|
| useCart | Cart state (items, add, remove, updateQty, total, clear). Persisted to localStorage. |
| useScreenTransition | Programmatic navigation with direction tracking (push/pop/modal) for AnimatePresence |
| useToast | Imperative toast API: `toast.success(msg)`, `toast.error(msg)`, `toast.warning(msg)` |
| useHaptic | Wraps Vibration API with graceful fallback — maps action names to vibration patterns |
| useScrollHeader | Scroll position tracking for glassmorphic header transition threshold |
| useLongPress | Long-press detection with interval callback (for quantity stepper continuous hold) |

---

## Animation Implementation

| Animation | Library / Approach | Implementation | Complexity |
|-----------|-------------------|----------------|------------|
| Page transitions (slide+fade push/pop) | Framer Motion | `AnimatePresence` + `motion.div` with `initial`/`animate`/`exit` variants. Direction derived from `useScreenTransition` (forward=slide-from-right, back=slide-from-left). | Medium |
| Bottom sheet modal | Framer Motion | `motion.div` with `translateY: 100% → 0`, spring physics (stiffness 300, damping 30). Backdrop opacity tween simultaneously. | Low |
| Spring button press | Framer Motion | `whileTap={{ scale: 0.97 }}` with spring transition on all PrimaryButton / IconButton instances. | Low |
| Button ripple effect | Custom CSS/JS | On click, create absolutely-positioned span at tap coordinates, animate scale 0→2 + opacity 0.2→0 over 0.6s, remove on completion. | Medium |
| Staggered card entrances | Framer Motion | Parent `motion.div` with `staggerChildren: 0.06` in transition. Children fade+translateY. Used on trending lists, menu items, order cards. | Low |
| Onboarding card swipe | Framer Motion + drag | `motion.div` with `drag="x"`, `dragConstraints`, `onDragEnd` velocity/distance threshold, `animate` to snap to next/prev card. Dot indicator position syncs via spring. | **High** |
| 3D Token Spinner | CSS 3D transforms | `perspective: 800px` container, digit panels as `transform: rotateX(n*36deg) translateZ(120px)`. Spin via `rotateX` keyframe from 0 to -(target*36 + 360*3)deg, 2s decelerate easing. Each digit in its own 3D cylinder. | **High** |
| Confetti celebration | canvas-confetti | `confetti()` call on order success / reward unlock. 80+ particles, brand colors, 3s duration, gravity + rotation. | Low |
| Status timeline connector draw | Framer Motion | SVG `line` or `motion.div` height animation with `useMotionValue` + `useTransform` linked to scroll/progress state. Shimmer via CSS gradient animation on in-progress segment. | Medium |
| Typewriter status text | Custom JS | `useEffect` with `setInterval` (30ms/char) appending characters to displayed string. Triggered on status change. Cursor blink optional. | Low |
| Animated progress ring | Framer Motion | SVG `circle` with `pathLength` animated via `motion.circle` from 0 to target. Color transitions via `useMotionValue` interpolation. | Low |
| Floating food particles | CSS keyframes | 8-12 absolutely-positioned emoji/span elements with `translateY(100vh → -10vh)` over 15-25s, infinite, randomized `animation-delay` and `animation-duration`. Pure CSS, no JS. | Low |
| Skeleton shimmer | CSS animation | `background: linear-gradient(90deg, ...)` with `background-position` animation sweeping left→right, 1.5s infinite. | Low |
| Toast slide | Framer Motion | `AnimatePresence` + `motion.div` with `translateY: -100% → 0` enter, `translateY: 0 → -100%` exit. Spring enter, ease-in exit. | Low |
| Cart bar slide | Framer Motion | `AnimatePresence` with `translateY: 100% → 0` enter / reverse exit. Spring transition. | Low |
| Canteen card hover lift | Framer Motion | `whileHover={{ y: -4, boxShadow: '...' }}` on CanteenCard. | Low |
| Add-to-cart morph | Framer Motion `layout` | `motion.div` with `layout` prop morphing width from 36px circle to ~120px stepper. Icon crossfades (Plus ↔ Minus/Number/Plus). | Medium |
| Swipe-to-delete | Framer Motion drag | `motion.div` with `drag="x"`, `dragConstraints={{ left: -100 }}`, reveal delete button beneath, release beyond threshold triggers delete animation (slide-out-left + list reflow). | Medium |
| Parallax banner | Framer Motion | `useScroll` + `useTransform` to map scroll Y to `translateY` at 0.3x rate on banner image. | Low |
| Active order banner pulse | CSS animation | `@keyframes` alternating `box-shadow` intensity, 2s infinite ease-in-out. | Low |
| Mystery box shake→burst | Framer Motion | Sequence: `rotate` keyframes for shake (0.4s), then `scale: 1→1.4` + white flash overlay, then crossfade to reward content + confetti trigger. | Medium |
| Revenue bar chart grow | Framer Motion | `motion.div` bars with `height: 0 → value%`, `staggerChildren: 0.08`, `duration: 0.6`, Ease Out. | Low |
| KPI number counter | react-countup | `<CountUp>` component with `duration={0.8}`, triggered on mount / refresh. | Low |
| Flame flicker | CSS animation | `@keyframes` with alternating `scale` and `rotate`, 0.8s infinite. | Low |
| Rush meter glow pulse | CSS animation | `@keyframes` alternating `box-shadow` opacity/spread, 2s infinite. 3 variants by level. | Low |
| Confetti trigger | canvas-confetti | Wrapped in a `useEffect` that fires `confetti()` on mount of OrderSuccess screen. | Low |
| Pull-to-refresh | Framer Motion drag | `drag="y"` with constraints, on exceed threshold show spinner, on release trigger refresh callback. | Medium |
| Search overlay expand | Framer Motion `layoutId` | Search bar uses `layoutId` to morph from compact position to full-screen top position. Backdrop fades. | Medium |
| Filter pill crossfade | Framer Motion `AnimatePresence` | Content below filter pills crossfades (opacity swap, `mode="wait"`) on active pill change. | Low |
| Category tab underline | Framer Motion `layoutId` | Shared `motion.div` with `layoutId="activeTab"` that springs to new position under active tab. | Low |
| Customization accordion | Framer Motion `animate` | `motion.div` with `animate={{ height: isOpen ? 'auto' : 0 }}`, content opacity fades with delay. | Low |
| Order card expand | Framer Motion `animate` | Same accordion pattern — `height: 'auto' ↔ 0` with content fade. | Low |
| New order arrival (dashboard) | Framer Motion | `AnimatePresence` + `motion.div` with `initial={{ y: -30, opacity: 0 }}`, spring enter. Green flash overlay. | Low |
| Notification bell badge pulse | Framer Motion | `motion.div` with `scale: [1, 1.4, 1]` + `boxShadow` glow on new notification trigger. | Low |
| Cart badge pulse | Framer Motion | `animate={{ scale: [1, 1.15, 1] }}` triggered on quantity change. | Low |
| Tab switch crossfade | Framer Motion `AnimatePresence` | Content wrapper with `AnimatePresence mode="wait"`, opacity exit→enter tween (200ms). | Low |
| Splash sequence | Framer Motion | Orchestrated `staggerChildren` timeline: loader fade+scale → logo fade+slide → text fade → exit fade. | Low |
| Header glassmorphic transition | Framer Motion `useScroll` | `useTransform(scrollY, [0, 60], [transparent, glass])` applied to background + backdrop-filter. | Low |

---

## State & Logic

### Routing

HashRouter with 14 routes. A custom `useScreenTransition` hook wraps `useNavigate` to track navigation direction (push/pop/modal) by pushing a `transition` field to location state. This direction drives `AnimatePresence` exit animations (slide-left on push, slide-right on pop, slide-up on modal).

### Global State

No external state library — React Context with `useReducer` is sufficient. Three contexts:

- **AppContext**: screen transition direction, active tab index, toast queue
- **CartContext**: items array (with quantity + customizations per item), total calculation, add/remove/update operations. Persisted to localStorage via `useEffect`.
- **OrderContext**: active order (for tracking), order history array, current token number

### Mock Data Architecture

All data lives in a single `mockData.ts` file exporting typed objects:
- `canteens[]`: 5 canteens with id, name, rating, tags, rushLevel, bannerImage, menu categories
- `menuItems[]`: 30+ items with id, canteenId, category, name, description, price, prepTime, image, isVeg, inStock
- `offers[]`: 5+ active offers with discount, description, validity, code
- `pastOrders[]`: 3 sample orders with items, totals, dates, status
- `userProfile`: name, email, walletBalance, streakDays, totalOrders

### Polling Simulation

Order tracking screen simulates live updates via `setInterval` (10s). Each tick randomly advances the order status through the 3-step pipeline. Status changes trigger the step-completion animation sequence and toast notification.

### Local Storage Persistence

- `fastfeast_cart`: serialized cart items
- `fastfeast_user`: user profile + preferences
- `fastfeast_onboarded`: boolean flag (skips onboarding on returning visit)

---

## Other Key Decisions

**No shadcn/ui**: The design requires heavy glassmorphism, gradient accents, and custom micro-interactions that conflict with shadcn's default styling. All components are custom-built with Tailwind to match the dark glassmorphic spec precisely.

**Lottie fallback**: No Lottie library is included. The splash loader uses a custom CSS-animated spinning element (rotating food emojis/orbit). The order success checkmark uses framer-motion path drawing on an SVG. This avoids adding the ~50KB lottie-web dependency.

**No charting library**: The admin revenue chart is a simple CSS/SVG bar chart animated with framer-motion. Adding recharts or chart.js for a single 7-bar chart is unjustified overhead.

**Responsive container**: The app renders full width on phones, expands into a rounded tablet/desktop frame up to 1280px, and keeps bottom navigation/cart controls aligned to that responsive frame.

**Authentication stub**: The app starts at Splash → (optionally Onboarding) → Login → Home. Login captures a user name and mobile number for the demo profile.

**Group Order real-time stub**: Group order "live updates" are simulated with `setInterval` random item additions. No WebSocket or server integration.
