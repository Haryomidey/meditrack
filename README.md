# MediTrack

MediTrack is an offline-aware, mobile-first community pharmacy app for stock, sales, and prescription tracking.

## Stack

- Frontend: React + TypeScript + Vite + Zustand + Framer Motion
- Backend: Node.js + Express + TypeScript + MongoDB
- Auth: JWT (access + refresh)
- Realtime: WebSocket (pharmacy-scoped live updates)
- PWA: Service worker + install manifest + app icons

## Features

- Authentication (signup/login)
- Inventory management
  - Add, edit, delete, restock
  - Low-stock and expiry visibility
- Sales
  - Cart checkout with stock deduction
  - Sales history with item-level breakdown
- Prescriptions
  - Add and delete prescriptions
  - Refill reminder support with next refill date
- Notifications (browser)
  - Immediate low-stock notification after stock drops to threshold or below
  - Repeating 30-minute checks for:
    - low stock
    - expiring soon
    - expired products
    - refill reminders
- Realtime sync
  - WebSocket pushes data updates to connected clients
  - UI auto-refreshes across devices/sessions in same pharmacy
- PWA install prompt
  - Top-right install card on eligible first load

## Project Structure

- Frontend app: root folder (`src/`, `index.html`, `sw.js`)
- Backend API: `backend/`

## Frontend Setup

1. Install dependencies:
   - `npm install`
2. Configure env (root `.env`):
   - `VITE_API_BASE_URL=http://localhost:4000/api`
3. Start frontend:
   - `npm run dev`

## Backend Setup

1. Go to backend folder:
   - `cd backend`
2. Install dependencies:
   - `npm install`
3. Create backend env from example:
   - copy `backend/.env.example` to `backend/.env`
4. Set required env values in `backend/.env`:
   - `PORT`
   - `NODE_ENV`
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `JWT_ACCESS_EXPIRES_IN`
   - `JWT_REFRESH_EXPIRES_IN`
   - `CORS_ORIGIN`
5. Start backend:
   - `npm run dev`

Backend default API base: `http://localhost:4000/api`

## Realtime (WebSocket)

- Backend WebSocket endpoint: `/ws`
- Frontend derives WS URL from `VITE_API_BASE_URL`
- Backend broadcasts updates for drugs, sales, prescriptions, suppliers, and sync operations

## PWA Notes

- Manifest: `public/manifest.webmanifest`
- Icons: `public/icons/`
- Service worker: `sw.js`

If icon/install prompt changes are not reflected, clear site data or reinstall the PWA.

## Scripts

Frontend:
- `npm run dev`
- `npm run build`

Backend (`backend/`):
- `npm run dev`
- `npm run check`
- `npm run build`
- `npm start`

## API Modules

- `/auth`
- `/drugs`
- `/sales`
- `/prescriptions`
- `/suppliers`
- `/reports`
- `/sync`
- `/audit-logs`