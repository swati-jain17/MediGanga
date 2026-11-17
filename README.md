# 🏥 MediGanga

**India's Fastest Pharmacy Delivery - Medicines in 10 Minutes**

A full-stack quick-commerce pharmacy platform with real-time order tracking, drug interaction checking, and automatic generic alternatives.

## ✨ Features

### Core Features
- 🚀 **10-Minute Delivery** - Geofenced dark stores for instant delivery
- 💊 **Generic Alternatives** - Auto-suggest cheaper generics with same salt composition
- ⚠️ **Drug Interaction Checker** - Real-time warnings (CONTRAINDICATED, MAJOR, MODERATE, MINOR)
- 📋 **Prescription OCR** - Automatic extraction with pharmacist verification
- 🎯 **Live Order Tracking** - Real-time rider location via WebSocket

### Technical Highlights
- Full-text medicine search with PostgreSQL
- PostGIS for geofencing and distance calculations
- Redis caching for frequently accessed data
- Schedule H/H1/X compliance enforcement
- Ayurveda section for traditional medicines

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + PostGIS
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Auth**: JWT with phone OTP

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: TailwindCSS v4
- **State**: Zustand
- **Data Fetching**: React Query
- **Animations**: Framer Motion

## 🚀 Quick Start

### Prerequisites
```bash
# Required
node >= 18
postgresql >= 14 with PostGIS
redis >= 7

# Environment variables
cp backend/.env.example backend/.env
```

### Installation
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
cd backend
npm run db:migrate
npm run db:seed
```

## 📁 Project Structure

```
boltmed/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, env config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helpers, validation schemas
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # UI components
    │   ├── pages/           # Route pages
    │   ├── services/        # API, WebSocket
    │   ├── store/           # Zustand stores
    │   └── types/           # TypeScript types
    └── package.json
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP & get token |
| GET | `/api/auth/profile` | Get user profile |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines/search` | Full-text search |
| GET | `/api/medicines/:id` | Get medicine details |
| GET | `/api/medicines/:id/generic` | Get generic alternative |
| GET | `/api/medicines/categories` | List categories |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/status` | Update order status |
| POST | `/api/orders/:id/cancel` | Cancel order |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/prescriptions` | Upload prescription |
| GET | `/api/prescriptions` | Get user prescriptions |
| GET | `/api/prescriptions/valid` | Get valid prescriptions |

### Interactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interactions/check` | Check drug interactions |

## 🎨 Design System

### Colors
- **Primary**: Teal (`#0d9488`)
- **Saffron**: Indian accent (`#f97316`)
- **Ayurveda**: Herbal green (`#22c55e`)
- **Coral**: Alert red (`#f43f5e`)

### Components
- Glassmorphism cards
- Gradient buttons
- Schedule badges (Rx, OTC)
- Severity-based warnings

## 🔐 Environment Variables

```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/medixpress
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000

# Optional
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
RAZORPAY_KEY_ID=xxx
```

## 📦 Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📄 License

MIT © 2026 MediXpress
