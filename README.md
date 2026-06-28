# School Management System (ERP)

Enterprise-grade School ERP starter scaffold with:

- Frontend: React + Vite + Tailwind + Redux Toolkit
- Backend: Node.js + Express + MongoDB + Session Auth + RBAC
- Base modules: Auth and Dashboard scaffolding

## Project Structure

- `backend` - Express API, Mongo models, middleware, module routes
- `frontend` - React app with login flow and dashboard shell

## Quick Start

1. Install dependencies
   - `npm install`
2. Configure backend env
   - Copy `backend/.env.example` to `backend/.env`
3. Start MongoDB (required for persistent data)
   - Windows service: `npm run mongo:start --workspace backend`
   - If MongoDB is not installed/running, backend auto-starts an in-memory dev database
4. Run both apps
   - `npm run dev`

## First Admin (optional)

Set these in `backend/.env` to auto-create the first Super Admin when the database has none:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME` (optional)

No default users are created without these variables.