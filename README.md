# School Management System (ERP)

Enterprise-grade School ERP starter scaffold with:

- Frontend: React + Vite + Tailwind + Redux Toolkit
- Backend: Node.js + Express + MongoDB + JWT + RBAC
- Base modules: Auth and Dashboard scaffolding

## Project Structure

- `backend` - Express API, Mongo models, middleware, module routes
- `frontend` - React app with login flow and dashboard shell

## Quick Start

1. Install dependencies
   - `npm install`
2. Configure backend env
   - Copy `backend/.env.example` to `backend/.env`
3. Run both apps
   - `npm run dev`

## Default Seed User

- Email: `admin@schoolerp.local`
- Password: `Admin@123`

This user is seeded automatically on backend startup if not found.