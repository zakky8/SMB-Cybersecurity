# ShieldDesk — Cybersecurity for Small Businesses

> Set up in 15 minutes. We handle everything else.

ShieldDesk is a self-serve SaaS cybersecurity platform for small businesses (1–200 employees) that requires zero IT knowledge. It protects against phishing, ransomware, weak passwords, malicious websites, and social engineering — all for a flat $99/month.

## Architecture

```
shielddesk/
├── apps/
│   ├── api/              # Fastify backend (TypeScript)
│   ├── dashboard/        # Next.js 14 frontend (React + Tailwind)
│   ├── agent-mac/        # Rust macOS endpoint agent
│   └── agent-windows/    # Rust Windows endpoint agent
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── email-templates/  # React Email notification templates
│   └── security-score/   # Scoring algorithm
└── docker-compose.yml    # Local dev (PostgreSQL, Redis, GoPhish)
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone and install
```bash
git clone https://github.com/zakky8/SMB-Cybersecurity.git
cd SMB-Cybersecurity/shielddesk
npm install
```

### 2. Start infrastructure
```bash
docker compose up -d postgres redis
```

### 3. Set up environment
```bash
cp .env.example .env
# Edit .env with your API keys (Stripe, Clerk, VirusTotal, etc.)
```

### 4. Initialize database
```bash
npm run db:push
```

### 5. Start development servers
```bash
npm run dev
```

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs

## 5 Security Layers

| Layer | What It Does |
|-------|-------------|
| Email Protection | Blocks phishing, BEC, malware attachments via Gmail/Outlook integration |
| Endpoint Protection | Lightweight agent detects ransomware, malware on Mac/Windows devices |
| Password & Access | Team password manager, MFA enforcement, breach monitoring |
| Network & DNS | DNS filtering, OAuth app monitoring, WiFi security scanning |
| Training & Simulation | Monthly phishing tests, 5-min training videos, security scoring |

## Tech Stack

- **Backend**: Fastify + TypeScript + Prisma + PostgreSQL + Redis + BullMQ
- **Frontend**: Next.js 14 + shadcn/ui + Tailwind CSS + Recharts + Zustand
- **Agents**: Rust (macOS ESF + Windows ETW + ClamAV)
- **Auth**: Clerk (OAuth 2.0, SSO)
- **Billing**: Stripe
- **Email**: AWS SES + React Email
- **Phishing Sim**: GoPhish (open source)
- **Infra**: Docker Compose (dev), AWS ECS/RDS (prod)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/dashboard/stats | Dashboard overview stats |
| GET/POST | /api/employees | Manage employees |
| GET | /api/threats | List threats |
| GET | /api/devices | List enrolled devices |
| POST | /api/email-scans | Submit email for scanning |
| GET | /api/breaches | Breach monitoring alerts |
| POST | /api/simulations | Launch phishing simulation |
| GET | /api/training | Training completion status |
| GET | /api/reports/monthly | Generate monthly PDF report |
| POST | /api/billing/checkout | Create Stripe checkout session |

## Environment Variables

See `.env.example` for the full list. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `CLERK_SECRET_KEY` — Clerk auth
- `STRIPE_SECRET_KEY` — Stripe billing
- `VIRUSTOTAL_API_KEY` — File/URL scanning
- `HIBP_API_KEY` — Breach monitoring
- `GOOGLE_CLIENT_ID/SECRET` — Google Workspace OAuth
- `MICROSOFT_CLIENT_ID/SECRET` — Microsoft 365 OAuth

## Testing

```bash
npm test                    # Run all tests
npm run test:e2e            # E2E tests (Playwright)
npm run lint                # ESLint
```

## Building Agents

```bash
# macOS agent
cd apps/agent-mac && cargo build --release

# Windows agent (cross-compile or build on Windows)
cd apps/agent-windows && cargo build --release
```

## Deployment

See `.github/workflows/deploy.yml` for the CI/CD pipeline. Production uses:
- AWS ECS Fargate for API
- Vercel for Dashboard
- RDS PostgreSQL Multi-AZ
- ElastiCache Redis

## License

Proprietary. All rights reserved.
