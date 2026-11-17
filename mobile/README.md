# MediGanga Mobile App

A React Native mobile application for MediGanga - your healthcare delivery platform.

## Features

✨ **Core Features**
- 🔐 User Authentication (Login/Register)
- 🏠 Home Screen with Categories
- 🔍 Medicine Search
- 🛒 Shopping Cart with Generic Alternatives
- ⚠️ Drug Interaction Warnings
- 📦 Order Placement & Tracking
- 👤 User Profile Management
- 💾 Offline Storage with AsyncStorage

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (TailwindCSS for React Native)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Navigation**: Expo Router (File-based routing)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## Prerequisites

- Node.js 16+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (for Mac) or Android Emulator
- Expo Go app on your physical device (optional)

## Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API Base URL:
   
   Edit `src/services/api.ts` and update the `BASE_URL`:
   - For iOS Simulator: `http://localhost:3000/api`
   - For Android Emulator: `http://10.0.2.2:3000/api`
   - For Physical Device: `http://<YOUR_IP>:3000/api`

## Running the App

1. Start the Metro bundler:
```bash
npm start
```

2. Choose your platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
mobile/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home screen
│   │   ├── orders.tsx       # Orders list
│   │   ├── cart.tsx         # Shopping cart
│   │   └── profile.tsx      # User profile
│   ├── order/
│   │   └── [id].tsx         # Order tracking
│   ├── login.tsx            # Login screen
│   ├── register.tsx         # Registration screen
│   ├── search.tsx           # Medicine search
│   ├── checkout.tsx         # Checkout flow
│   └── _layout.tsx          # Root layout
├── src/
│   ├── services/            # API services
│   ├── store/               # Zustand stores
│   └── types/               # TypeScript types
├── global.css               # NativeWind styles
├── tailwind.config.js       # Tailwind configuration
└── metro.config.js          # Metro bundler config
```

## Key Screens

### Authentication
- **Login**: Email/password authentication
- **Register**: New user registration

### Main Tabs
- **Home**: Quick search, categories, services
- **Orders**: Order history with status tracking
- **Cart**: Shopping cart with quantity controls
- **Profile**: User settings and preferences

### Additional Screens
- **Search**: Medicine search with filters
- **Checkout**: Order placement with delivery details
- **Order Tracking**: Real-time order status updates

## Features in Detail

### State Management
- **Auth Store**: User authentication state and profile
- **Cart Store**: Shopping cart with persistence

### API Integration
All API calls use the same backend as the web app:
- Authentication
- Medicine search and details
- Cart operations with generic alternatives
- Drug interaction checking
- Order creation and tracking

### Offline Support
- Cart items persisted in AsyncStorage
- Auth tokens stored locally
- App state restored on launch

## Building for Production

### iOS
```bash
npm run build:ios
```

### Android
```bash
npm run build:android
```

## Environment Variables

Create a `.env` file (if needed):
```
API_BASE_URL=http://localhost:3000/api
```

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Simulator Issues
```bash
npx expo run:ios --clean
```

### Android Emulator Issues
```bash
npx expo run:android --clean
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test on both iOS and Android
4. Submit a pull request

## License

MIT
