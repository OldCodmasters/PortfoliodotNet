# PortfolioWebDotNet

Personal portfolio for **Amin Dehghani** — a modular-monolith .NET 10 backend + Next.js 16 frontend with an iOS 26 Liquid Glass UI and an interactive terminal.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full stack, module boundaries, and conventions.

## Quick start

```bash
# backend
cd backend/src/Portfolio.Api
dotnet run --urls http://localhost:5080

# frontend (second terminal)
cd frontend
npm install
npm run dev          # http://localhost:3000
```

## Layout

- `backend/` — .NET 10 modular monolith (Commands / Content / Resume modules).
- `frontend/` — Next.js 16 App Router with Tailwind v4 + motion.
- `ARCHITECTURE.md` — the living architecture document.
