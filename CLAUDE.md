# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

REST API for a carpentry shop (Marcenaria do Gaúderio) built with Node.js, TypeScript, Express 5, and MongoDB (Mongoose). Allows customers to get price quotes for custom furniture based on dimensions, and allows admins to manage products and materials.

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server with hot-reload (ts-node-dev)
npm run devStart

# Start MongoDB via Docker
sudo docker-compose up -d

# Create the first admin user (run once, requires .env configured)
npx ts-node scripts/create_admin.ts
```

There are no lint or test scripts configured.

## Environment Setup

Copy `.env.example` to `.env`. Required variables:
- `PORT` — server port (default 3001)
- `DATABASE_URL` — MongoDB connection string (e.g. `mongodb://root:examplepassword@localhost:27017/landing-page?authSource=admin`)
- `JWT_SECRET` — JWT signing secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — required for product photo uploads
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — used by the admin creation script

## Architecture

**Entry points:**
- `server.ts` — loads `.env`, connects to MongoDB, starts Express
- `app.ts` — configures Express (CORS, Helmet, routes, global error handler)

**Request flow:** Route → (rate limiter) → (auth middleware) → Controller → Model/Service → Error middleware

**Three resource groups:**
- `/api/auth` — register, login, update password
- `/api/products` — CRUD for furniture products; public reads, protected writes; `POST /quote/:id` returns dynamic price estimate
- `/api/materials` — CRUD for raw materials; all routes require auth

**Pricing logic** (`services/pricing_service.ts`): Calculates product price by iterating over `components` (each links a `Material` + `quantityType` + `quantityFactor`). Three quantity modes:
- `fixed` — flat quantity regardless of size
- `area_based` — quantity × (height × width in m²)
- `perimeter_based` — quantity × (perimeter in meters)

Final price = (material costs × waste factors + `baseLaborCost`) × (1 + `profitMargin` / 100)

**Validation:** Zod schemas are defined inline in each controller. Use `safeParse` and return `error.flatten().fieldErrors` on failure.

**Error handling:** All controllers pass errors to `next(err)`. Use `app_error_class` (from `middlewares/error_handling_middleware.ts`) for operational errors with a status code. The global error handler in `app.ts` handles `app_error_class`, Mongoose `CastError`, and duplicate key (`11000`) errors.

**Auth:** JWT Bearer token. The `auth_middleware` attaches `userId` to `req` as `AuthRequest`. Use `AuthRequest` type when accessing `req.userId` in protected controllers.

**File uploads:** Multer + Cloudinary (`controllers/config/multer.ts`). Products accept up to 5 photos via `upload.array('photos', 5)`.

## Conventions

- Naming: `snake_case` for all functions, variables, and file names
- Models export both the Mongoose model (default) and a TypeScript interface (e.g. `IProduct`)
- Rate limiters are applied per-router: general (`rate_limiter`) on all routes, stricter (`rate_limiter_login`) on `POST /login`
- CORS is restricted to `localhost:12000` and `localhost:12001`
