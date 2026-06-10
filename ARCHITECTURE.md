# PortfolioWebDotNet — Architecture

Personal portfolio for **Amin Dehghani**. Ported from the original Ruby on Rails implementation at `../PortfolioWebRails/` to a **modular monolith** built on **.NET 10** (backend API) and **Next.js 16 / React 19** (frontend).

This document is the living source of truth for the stack, structure, conventions, and methods used across the project. **Update it whenever the architecture changes.**

---

## 1. Goals & guiding principles

| Principle | How it shows up |
|---|---|
| **KISS** | No ceremony. Portfolio has one important feature (terminal) and a handful of content endpoints — no gateway, no service discovery, no event bus. |
| **Clean Architecture (per module)** | Each module has four layers: Domain → Application → Infrastructure → Endpoints. Inner layers never depend on outer layers. |
| **Modular monolith (microservice-shaped)** | Each bounded context is isolated in its own set of projects. Modules talk via the host only. Any module can be extracted to its own service later without touching the others. |
| **Server-first rendering** | Pages fetch from the API at request time via React Server Components. The browser only hydrates the interactive bits (terminal, dot nav, reveal animations). |
| **iOS 26 Liquid Glass** | Every elevated surface is a frosted-glass card (`backdrop-filter: blur + saturate`) with inner-edge specular highlights, pill buttons, and spring transitions. |

---

## 2. Repository layout

```
PortfolioWebDotNet/
├── ARCHITECTURE.md                  # this file
├── global.json                      # pins .NET SDK to 10.0.x
├── backend/
│   ├── PortfolioWebDotNet.slnx      # solution (new .slnx format)
│   ├── tests/                       # test projects (reserved)
│   └── src/
│       ├── Portfolio.Api/           # ASP.NET Core host (Minimal API)
│       │   ├── Program.cs
│       │   ├── appsettings*.json
│       │   └── wwwroot/
│       │       ├── pdfs/            # CV PDF served statically
│       │       └── images/          # hero image
│       ├── Shared/
│       │   ├── Portfolio.SharedKernel/            # pure primitives (no framework refs)
│       │   │   └── Primitives/                    # Entity, Result<T>
│       │   └── Portfolio.SharedInfrastructure/    # cross-cutting infra
│       │       └── Modules/                       # IModule, ModuleExtensions
│       └── Modules/
│           ├── Commands/            # interactive terminal bounded context
│           │   ├── Commands.Domain/          (CommandResult)
│           │   ├── Commands.Application/     (ICommandExecutor, ICommandHandler, IClock, Handlers/)
│           │   ├── Commands.Infrastructure/  (SystemClock, DI)
│           │   └── Commands.Endpoints/       (CommandsEndpoints, CommandsModule)
│           ├── Content/             # bio, experience, skills, awards
│           │   ├── Content.Domain/           (HeroProfile, ExperienceItem, SkillCategory, Award, PortfolioContent)
│           │   ├── Content.Application/      (IPortfolioContentService)
│           │   ├── Content.Infrastructure/   (HardcodedPortfolioContentService)
│           │   └── Content.Endpoints/        (ContentEndpoints, ContentModule)
│           └── Resume/              # CV download
│               ├── Resume.Domain/            (ResumeDocument)
│               ├── Resume.Application/       (IResumeService)
│               ├── Resume.Infrastructure/    (FileSystemResumeService)
│               └── Resume.Endpoints/         (ResumeEndpoints, ResumeModule)
├── frontend/                        # Next.js 16 app
│   ├── next.config.ts
│   ├── package.json
│   ├── .env.local                   # NEXT_PUBLIC_API_URL
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx             # server component, fetches portfolio from API
│       │   └── globals.css          # Tailwind v4 + iOS 26 Liquid Glass design tokens
│       ├── lib/
│       │   ├── api.ts               # fetch helpers
│       │   └── types.ts             # TS types mirroring backend DTOs
│       └── components/
│           ├── Header.tsx           # client — nav pill, animated underline, sheet readout
│           ├── Hero.tsx
│           ├── ExperienceSection.tsx
│           ├── SkillsSection.tsx
│           ├── AwardsSection.tsx
│           ├── EngineeringScene.tsx # client — canvas "Wonderland" backdrop (grid/traces/gears)
│           ├── DecoderText.tsx      # client — machine-readout text reveal
│           ├── PortraitViewport.tsx # client — hero portrait: scan sweep, tilt, drawn reticle
│           ├── SpotlightCard.tsx    # client — pointer-tracked card highlight
│           ├── DotNav.tsx           # client — connected dot rail with label flyouts
│           ├── FlyIn.tsx            # client — staggered enter/exit motion
│           ├── Terminal.tsx         # client — interactive CLI
│           └── worklife/
│               ├── WorkLifeCinema.tsx      # client — "My Work Life" as an auto-playing presentation
│               └── MachineSilhouettes.tsx  # 15 side-view station drawings (SMT line, software factory, maintenance bay)
└── docs/                            # reserved for future diagrams
```

---

## 3. Stack & frameworks

### Backend — .NET 10
| Piece | Version | Why |
|---|---|---|
| **.NET SDK** | 10.0.202 | Latest LTS, pinned via `global.json`. |
| **ASP.NET Core Minimal APIs** | .NET 10 | Every endpoint is a `Map{Get,Post}` — less ceremony than MVC controllers for this size. |
| **Microsoft.AspNetCore.OpenApi** | 10.0.6 | Native OpenAPI document at `/openapi/v1.json` in Development. |
| **EF Core** | *not wired yet* | Reserved — each module will add its own `DbContext` when data is needed. Current content is static. |
| **Solution format** | `.slnx` | New XML-based solution format introduced with recent .NET SDKs. |

### Frontend — Next.js 16
| Piece | Version | Why |
|---|---|---|
| **Next.js** | 16.2.4 | App Router, React Server Components, Turbopack dev. *Note: Next 16 renamed Middleware → Proxy.* |
| **React** | 19.2.4 | Matches Next 16 requirement. |
| **TypeScript** | 5.x | |
| **Tailwind CSS** | v4 | Config-less `@theme` block directly in `globals.css`. |
| **motion** (Framer Motion) | 12.38 | Springs + scroll reveals + layout animations. Imported as `motion/react`. |
| **ESLint** | 9 + `eslint-config-next` | |

### Language choices
- Backend: **C# 13** with `ImplicitUsings=enable` and `Nullable=enable` in every project.
- Frontend: **TypeScript strict mode**, absolute imports via `@/*`.

---

## 4. Modular monolith — the rules

### Clean Architecture layering (inside each module)

```
┌─────────────────── Endpoints ───────────────────┐   ← HTTP surface + IModule registration
│  uses Infrastructure (DI) and Application       │
└──────────────────── ▼ ──────────────────────────┘
┌───────────────── Infrastructure ────────────────┐   ← adapters (file system, clock, EF Core)
│  uses Application and SharedInfrastructure      │
└──────────────────── ▼ ──────────────────────────┘
┌───────────────── Application ───────────────────┐   ← use cases, orchestration interfaces
│  uses Domain only                               │
└──────────────────── ▼ ──────────────────────────┘
┌─────────────────── Domain ──────────────────────┐   ← entities, value objects, rules
│  uses SharedKernel only                         │
└─────────────────────────────────────────────────┘
```

**Rule:** dependencies only ever point downward. Endpoints can see Infrastructure; Infrastructure cannot see Endpoints. Domain has **zero** framework references.

### Module contract — `IModule`

Every module exposes exactly one class that implements `Portfolio.SharedInfrastructure.Modules.IModule`:

```csharp
public interface IModule
{
    string Name { get; }
    IServiceCollection RegisterServices(IServiceCollection services, IConfiguration configuration);
    IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints);
}
```

The host (`Portfolio.Api/Program.cs`) holds an `IModule[]` and calls `RegisterModules(...)` and `MapModules(...)`. Adding a new module is:

1. Create four projects: `{Name}.Domain`, `{Name}.Application`, `{Name}.Infrastructure`, `{Name}.Endpoints`.
2. Wire the reference chain (Domain → SharedKernel; Application → Domain; Infrastructure → Application + SharedInfrastructure; Endpoints → Application + Infrastructure + SharedInfrastructure).
3. Implement one `{Name}Module : IModule` class in the Endpoints project.
4. Add it to the `IModule[]` array in `Program.cs`.

Nothing else in the codebase needs to change. That is the "microservice-shaped" property — every module could be hoisted into its own process with just a new host.

### Cross-module communication

**Not allowed** to reach into another module's internals. If two modules need to collaborate, either:
1. Talk over the HTTP surface (same as an external client), or
2. Publish a contract type in a future `{Name}.Contracts` assembly that can be referenced by any module.

Currently no module depends on another. The only shared project referenced by modules is `Portfolio.SharedInfrastructure` (for `IModule`).

---

## 5. Modules

### 5.1 Commands — the interactive CLI

Ports the 18-command terminal from the original Rails `CommandsController`.

- **Domain** — `CommandResult` value object with `Output` + `ClearTerminal` flag. Factories: `Text(string)`, `Clear()`, `NotFound(name)`.
- **Application**:
  - `ICommandExecutor` — the one-method entrypoint (`Execute(string input)`).
  - `CommandExecutor` — splits input into `name + args`, dispatches to the right `ICommandHandler` by name (case-insensitive).
  - `ICommandHandler` — one interface with `Names` (supports aliases, e.g. `ls`/`dir`, `resume`/`cv`) and `Handle(args)`.
  - `IClock` — abstraction for testability (used by `DateHandler`).
  - `Handlers/*.cs` — one class per command: `HelpHandler`, `AboutHandler`, `SkillsHandler`, `EducationHandler`, `ExperienceHandler`, `ProjectsHandler`, `ContactHandler`, `PortfolioHandler`, `ResumeHandler`, `SocialHandler`, `WhoamiHandler`, `PwdHandler`, `LsHandler`, `EchoHandler`, `DateHandler`, `ClearHandler`.
- **Infrastructure** — `SystemClock` (real clock), `AddCommandsModule` DI extension.
- **Endpoints** — `POST /api/commands/execute` taking `{ command: string }`, returning `{ result: string, clearTerminal: bool }`.

**Why per-class handlers:** each command is a single responsibility; aliases live with the handler they belong to; adding a new command is one file + one line in `DependencyInjection.cs`. Substitutable for testing via the `ICommandHandler` interface.

### 5.2 Content — portfolio payload

Delivers the structured bio as JSON.

- **Domain** — `HeroProfile`, `ExperienceItem`, `SkillCategory`, `Award`, and the aggregate `PortfolioContent` record.
- **Application** — `IPortfolioContentService`.
- **Infrastructure** — `HardcodedPortfolioContentService` holds the static content inline (matches the Rails implementation, which also had zero DB tables). When content moves to a DB, swap this implementation for an EF-backed one; nothing else changes.
- **Endpoints**:
  - `GET /api/content` — full `PortfolioContent`.
  - `GET /api/content/hero` / `/experience` / `/skills` / `/awards` — scoped slices.

### 5.3 Resume — CV download

- **Domain** — `ResumeDocument` (file name, content type, absolute path).
- **Application** — `IResumeService`.
- **Infrastructure** — `FileSystemResumeService` reads from `wwwroot/pdfs/Amin-DehghaniCV2024.pdf`, resolved via `IWebHostEnvironment.WebRootPath`.
- **Endpoints** — `GET /api/resume/download` returns the PDF as `application/pdf` with a `Content-Disposition: attachment` filename.

---

## 6. Frontend architecture

### Rendering model
- `src/app/page.tsx` is a **React Server Component**. It calls `fetchPortfolio()` on the server, which hits `GET /api/content` on the .NET API, then passes the resulting `Portfolio` down to the section components.
- Every section renderer (`Hero`, `ExperienceSection`, `SkillsSection`, `AwardsSection`) is a **server component** — they output static HTML with no JS cost.
- The only **client components** are `Terminal`, `DotNav`, and `Reveal` (they need state, effects, or event handlers). The `'use client'` boundary stays as narrow as possible.

### API access
- `src/lib/api.ts` centralises all `fetch()` calls and reads `NEXT_PUBLIC_API_URL` from the environment (defaults to `http://localhost:5080`).
- `src/lib/types.ts` holds TypeScript types that **mirror** the backend DTOs. These are currently hand-maintained; a future improvement is to generate them from the backend's OpenAPI document.

### Design system — iOS 26 Liquid Glass
Defined as Tailwind v4 `@theme` tokens and reusable `@layer components` classes in `globals.css`:

| Token / Class | Purpose |
|---|---|
| `--color-canvas`, `--color-canvas-elevated` | Deep space base + elevated glass underlay. |
| Body `background` | Three radial gradients (blue / violet / teal) over `--color-canvas` — the warm ambient glow behind glass. |
| `.glass` | Base frosted surface: `backdrop-filter: blur(28px) saturate(160%)`, dual-gradient background, 1px inner border, layered glass shadow. The `::before` pseudo renders a 1px gradient inner edge (the iOS "specular") using mask-composite: exclude. |
| `.specular` | Optional `::after` pseudo that adds a soft top highlight inside the card — the "glass got light on top" illusion. |
| `.glass-sm` / `.glass-pill` | 18px / full radius variants. |
| `.pill-btn` | The signature iOS capsule button with hover lift. |
| `.accent-gradient-text` | Tri-stop gradient text (accent → accent-2 → accent-3). |
| `--ease-spring` | CSS `linear()` easing that mimics a spring curve (used where we don't need JS). |

### Motion & cinematic layer ("Wonderland of Engineering")
`motion/react` (the renamed Framer Motion package) powers:
- `PageShell` — direction-aware camera moves between sections (zoom + blur, reversed when navigating back) with staggered `FlyIn` children.
- `DotNav` / `Header` — shared-element active-ring and nav underline using `layoutId`.
- `PortraitViewport` — spring pointer tilt + pathLength draw-in of the reticle and corner brackets.
- `Terminal` — collapse/expand height spring + the root card's `layout` prop for smooth resize.

Self-animating layers (no interaction required, all `aria-hidden`, all
disabled or frozen under `prefers-reduced-motion`):
- `EngineeringScene` — fixed canvas behind everything: parallax blueprint grids, procedural PCB traces with traveling signal pulses, slow line-art gears. Accent hue cross-fades per section; colors flip for the light theme; rAF pauses on hidden tabs; dpr capped at 2.
- CSS keyframes in `globals.css` — aurora blobs, film grain, award shine sweep, hero scan line, timeline rail growth, node pulse rings.
- `DecoderText` — the hero name decodes from scrambled glyphs on mount.
- `WorkLifeCinema` — the Work Life section plays as a letterboxed projection: machine silhouettes on a conveyor, a gliding stage spotlight, a payload riding the belt, and PowerPoint-style auto-advancing slides with a pause control.

The default theme is **light** (paper datasheet); a stored `portfolio.theme`
preference always wins, and the dark theme remains fully supported.

---

## 7. Contracts (HTTP surface)

All endpoints return JSON unless noted. JSON is camelCase (configured in `Program.cs`).

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/health` | — | `{ status, modules: string[] }` |
| `POST` | `/api/commands/execute` | `{ command: string }` | `{ result: string, clearTerminal: bool }` |
| `GET` | `/api/content` | — | `PortfolioContent` |
| `GET` | `/api/content/hero` | — | `HeroProfile` |
| `GET` | `/api/content/experience` | — | `ExperienceItem[]` |
| `GET` | `/api/content/skills` | — | `SkillCategory[]` |
| `GET` | `/api/content/awards` | — | `Award[]` |
| `GET` | `/api/resume/download` | — | `application/pdf` attachment |
| `GET` | `/openapi/v1.json` | — | OpenAPI document (Development only) |

### CORS
`Program.cs` reads allowed origins from `Cors:AllowedOrigins` in `appsettings.*.json`. Development defaults to `http://localhost:3000` and `http://127.0.0.1:3000`.

---

## 8. Running locally

Prerequisites:
- .NET 10 SDK (`dotnet --list-sdks` should show a `10.x` entry).
- Node.js 20+ and npm.

Backend:
```bash
cd backend/src/Portfolio.Api
dotnet run --urls http://localhost:5080
```

Frontend (in a second shell):
```bash
cd frontend
npm install   # first time only
npm run dev   # http://localhost:3000
```

Sanity checks:
```bash
curl http://localhost:5080/api/health
curl -X POST -H "Content-Type: application/json" -d '{"command":"help"}' http://localhost:5080/api/commands/execute
```

### Build everything
```bash
dotnet build backend/PortfolioWebDotNet.slnx
cd frontend && npm run build
```

---

## 9. Conventions

- **Namespaces** match folder names. Module code lives in `{Module}.{Layer}` namespaces (e.g. `Commands.Application.Handlers`). Shared code lives in `Portfolio.SharedKernel.*` / `Portfolio.SharedInfrastructure.*`.
- **Nullable reference types** are on everywhere.
- **DTOs are `record`s** — immutable by default.
- **One public type per file** in backend code (handlers, endpoints, DTOs).
- **Frontend components** are `PascalCase.tsx`. A component that uses hooks, effects, or events starts with `"use client"`.
- **No barrel re-exports** on the backend (keep grep'ing simple). The frontend may use folder-level `index.ts` where it adds clear value.
- **Comments** are rare — only when the why is non-obvious.

---

## 10. Deployment

*Deferred.* Options under consideration:
- **Render** (keeps parity with the Rails version's `render.yaml`).
- **Azure** — Container Apps for the API, Static Web Apps or Azure App Service for Next.js.
- **Vercel (frontend) + Azure / Render (API)** — the most common split for this stack.

When a target is picked, this section will describe the Dockerfile(s), environment variables, CI, and CDN/domain setup.

---

## 11. Testing strategy

*Reserved.* `backend/tests/` is an empty folder waiting for:
- Unit tests for each `ICommandHandler`.
- Unit tests for `CommandExecutor` (dispatch, aliasing, unknown command).
- Integration tests spinning up `WebApplicationFactory<Program>` to hit the real endpoints.

Frontend tests — to be decided (Playwright for the terminal round-trip is the obvious candidate).

---

## 12. Roadmap (non-binding)

- Persist content to SQLite via EF Core so the bio can be edited without redeploys.
- Add a small admin endpoint or CLI behind auth to edit content.
- Generate frontend TS types from OpenAPI.
- Add a dark/light switch (the current UI is dark-only by design).
- Extend the CLI with `cat <section>`, `open <link>`, and a fuzzy `search`.
