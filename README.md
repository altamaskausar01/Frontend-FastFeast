<div align="center">
  <br />
  <h1>⚡ Fast Feast</h1>
  <p><strong>Smart Canteen Food Ordering — Skip the Queue, Not the Flavor</strong></p>
  <br />
  <p>
    <img src="https://img.shields.io/badge/React-19-149eca?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js" alt="Node.js 20" />
    <img src="https://img.shields.io/badge/Express-4.21-000000?logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-8.9-47A248?logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </p>
  <br />
</div>

---

## 📋 Overview

**Fast Feast** is a full-stack campus canteen food ordering platform that lets students browse menus, pre-order from their favorite canteens, pay digitally, skip queues, and track orders in real-time. Built with a dark, glassmorphic UI and fluid micro-interactions, it delivers a native-app experience in the browser.

### 🎯 The Problem

Campus canteens are crowded during lunch and break hours. Students waste 15–20 minutes waiting in line, often missing their preferred dishes when they finally reach the counter.

### ✅ The Solution

Fast Feast digitizes the entire ordering workflow: browse canteens and menus → customize and add to cart → pay via UPI or wallet → receive a pick-up token → track order status live → collect without queuing.

---

## ✨ Features

### 👤 User App
| Feature | Details |
|---------|---------|
| **Onboarding & Auth** | 3-step carousel, mobile OTP login, user profile persistence |
| **Smart Home Feed** | Time-based greeting, trending items, fastest-to-prepare section, search & filters |
| **Canteen Discovery** | Scroll-snap carousel with rush indicators (low/medium/high), rating, tags |
| **Menu Browsing** | Category tabs, search, veg/non-veg indicators, stock status, spice customization |
| **Cart** | Quantity stepper with long-press, bill breakdown (GST + platform fee), suggested combos |
| **Checkout & Payment** | UPI, wallet, pay-at-counter options, confetti celebration on success |
| **Order Token & QR** | 3D spinning digit reveal, QR code for counter scan |
| **Live Order Tracking** | 3-step animated status timeline (Received → Preparing → Ready), progress ring, queue position |
| **Order History** | Active/past tabs, expandable details, one-tap reorder |
| **Group Orders** | Shared cart with live participant avatars, invite link, lock & pay flow |
| **Offers & Rewards** | Streak tracking with animated flame, daily deals carousel, mystery reward box, coupon codes |
| **Profile** | Wallet, stats (orders/saved/streak), dark mode toggle, settings |

### 🏪 Canteen Dashboard
| Feature | Details |
|---------|---------|
| Order inflow stats (new / preparing / ready / today) | Live load meter |
| Accept / reject / mark-ready actions | Pause new orders toggle |
| Group order indicators | Filterable order list |

### 🛠️ Admin Panel
| Feature | Details |
|---------|---------|
| KPI cards (users, orders, revenue, canteens) | Revenue overview |
| Canteen management table | Quick actions (offers, commissions, users, reports) |

---

## 🧰 Tech Stack

### Frontend — `app/`

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript 5.9 |
| **Build Tool** | Vite 7 |
| **Routing** | HashRouter with animated `AnimatePresence` transitions |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui base theme |
| **Animations** | Framer Motion 12 (spring physics, layout animations, SVG path drawing) |
| **Icons** | Lucide React |
| **Charts** | Custom SVG/CSS bar charts (no heavy charting lib) |
| **QR** | qrcode.react |
| **Confetti** | canvas-confetti |
| **Counters** | react-countup |
| **HTTP** | Axios |
| **State** | React Context + useReducer (no external state library) |

### Backend — `backend/`

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20 + TypeScript |
| **Framework** | Express 4.21 |
| **Database** | MongoDB 8.9 via Mongoose |
| **Auth** | JWT + bcryptjs |
| **Validation** | Zod schemas |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Morgan |
| **Testing** | Jest 30 + Supertest + mongodb-memory-server |
| **Coverage** | 90%+ code coverage across controllers, middleware, and utils |

---

## 🏗️ Architecture

```
FastFeast/
├── app/                         # React frontend
│   ├── src/
│   │   ├── components/          # Shared UI components + shadcn/ui
│   │   │   └── ui/             # 40+ headless UI primitives
│   │   ├── screens/             # 15 screen-level components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client layer (Axios)
│   │   ├── types/               # TypeScript type definitions
│   │   ├── data/                # Mock data for offline dev
│   │   └── App.tsx              # Root with AnimatePresence router
│   └── index.html
│
├── backend/                     # Express API server
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express routers
│   │   ├── middleware/          # Auth, error, validation
│   │   ├── utils/               # ApiResponse, ApiError, token gen
│   │   ├── config/              # DB connection, env config
│   │   ├── seed/                # Database seed script
│   │   └── __tests__/           # Unit + integration tests
│   └── tsconfig.json
│
├── tech-spec.md                 # Detailed technical specification
└── README.md
```

### 📱 Screen Map

| Route | Screen | Auth Required |
|-------|--------|:---:|
| Splash | Logo + load check | ❌ |
| Onboarding | 3-step carousel | ❌ |
| Login | Mobile OTP | ❌ |
| Home | Canteens, trending, filters | ✅ |
| CanteenDetail | Menu by category | ✅ |
| Cart | Items, combos, bill | ✅ |
| Payment | UPI / wallet / counter | ✅ |
| OrderSuccess | Token + QR + confetti | ✅ |
| OrderTracking | Live status timeline | ✅ |
| Orders | Active / past history | ✅ |
| GroupOrder | Shared cart with friends | ✅ |
| Offers | Deals, streak, mystery box | ✅ |
| Profile | Wallet, settings, logout | ✅ |
| CanteenDashboard | Order management (canteen staff) | ✅ |
| AdminPanel | KPI + canteen management | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm, pnpm, or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-username/fast-feast.git
cd fast-feast

# Install frontend dependencies
cd app
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Variables

```bash
cd backend
cp .env.example .env   # Create your .env file
```

**Required variables:**
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |

### 3. Seed the Database

```bash
cd backend
npm run seed
```

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd app
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🧪 Testing

```bash
cd backend
npm test                # Run all tests
npm run test:coverage   # With coverage report
```

The backend achieves **90%+ line coverage** across all modules.

---

## 🎨 Design Highlights

- **Dark glassmorphic theme** — backdrop-blur cards, subtle borders, layered depth
- **Food-gradient palette** — warm orange-to-red gradients as accent colors
- **Atomic micro-interactions** — spring press on every button, staggered list entrances, layout morphing on add-to-cart, SVG path drawing for progress
- **3D Token Spinner** — CSS perspective cylinder animates digits on order success
- **Orbiting food emojis** — ambient floating particles on splash and home screens
- **Confetti celebrations** — order placement, mystery reward unlock, streak milestones
- **Responsive frame** — full-width on mobile, rounded desktop container up to 1280px

---

## 📐 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| No external state library | `useReducer` + Context is sufficient for this complexity |
| No shadcn/ui dependency | Custom glassmorphic design conflicts with shadcn defaults |
| No charting library | Single revenue chart → custom SVG bars animated with Framer Motion |
| No WebSocket | Order tracking uses `setInterval` polling simulation |
| No Lottie | Splash loader uses CSS keyframes instead of 50KB lottie-web |

---

## 📄 License

MIT © AKMH TEAM

---

<div align="center">
  <sub>Built with ❤️ for hungry students everywhere</sub>
</div>
