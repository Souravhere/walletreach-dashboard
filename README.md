# WalletReach Dashboard (Frontend)

Next.js dashboard for WalletReach internal holder growth engine.

## 🚀 Features

- **Vercel-Style UI**: Clean black & white design with high contrast
- **Role-Based Access**: Different views for Super Admin and Operator
- **Real-Time Updates**: Live campaign monitoring and alerts
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion micro-interactions

## 📋 Prerequisites

- Node.js 18+
- Running WalletReach backend

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

## ⚙️ Configuration

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production (Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 🏃 Running

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## 📱 Pages

- `/login` - Authentication
- `/dashboard` - Main overview
- `/dashboard/users` - User management (Super Admin only)
- `/dashboard/keys` - Wallet management
- `/dashboard/campaigns` - Campaign list and creation
- `/dashboard/campaigns/new` - Create new campaign wizard
- `/dashboard/campaigns/[id]` - Campaign details
- `/dashboard/alerts` - System alerts
- `/dashboard/logs` - Transaction and audit logs
- `/dashboard/analytics` - Analytics and metrics
- `/dashboard/settings` - System settings (Super Admin only)

## 🎨 Design System

### Colors
- Background: `#000000` (black)
- Foreground: `#ffffff` (white)
- Border: `#333333`
- Muted: `#666666`

### Components
All components follow Vercel-style design principles:
- Minimal borders
- No shadows
- High contrast
- Clean typography (Inter font)

## 🔐 Authentication

JWT token stored in localStorage:
- `walletreach_token` - JWT token
- `walletreach_user` - User info

Auto-redirect on 401 responses.

## 📦 Key Libraries

- **Next.js 14**: App Router
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Recharts**: Analytics charts
- **React Icons**: Icon library
- **Axios**: HTTP client

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
3. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

Or use PM2:
```bash
pm2 start npm --name "walletreach-dashboard" -- start
```

## 📝 Features Implemented

✅ Login page with JWT authentication
✅ Dashboard with overview stats
✅ Running campaigns monitor
✅ Alerts notification system
✅ Responsive sidebar navigation
✅ Role-based menu items
✅ Real-time unread alerts badge
✅ Logout functionality

## 🔨 To Be Implemented

Additional pages (planned structure created):
- User management page
- Wallet management page  
- Campaign creation wizard
- Campaign details page
- Alerts page
- Logs page
- Analytics page
- Settings page

## 📄 License

PRIVATE - Internal use only.
# walletreach-dashboard
