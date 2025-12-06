# 🎯 Radar Narcisista – AI-Powered SaaS for Relationship Clarity

> **Advanced MVP (97% complete), available for acquisition as a technological ASSET.**

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![Stripe](https://img.shields.io/badge/Stripe-Billing-purple)
![AI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Anthropic-orange)

---

## 📋 Overview

**Radar Narcisista** is a web platform (SaaS) that uses **Artificial Intelligence + structured journaling** to help people gain clarity in potentially abusive or toxic relationships.

### The Problem It Solves

Millions of people live in relationships where they suffer manipulation, gaslighting, control, or emotional abuse – but can't see the pattern. Radar offers:

- **Guided journaling** to record episodes and feelings
- **Automatic risk pattern detection** via AI
- **Visual indicators** of problematic behaviors
- **Clarity Coach (Oracle)** – AI assistant for reflection
- **Professional dashboard** (psychologists, therapists)

> ⚠️ **IMPORTANT**: Radar does NOT provide clinical diagnosis and does NOT replace professional mental health care.

---

## 🌐 Language Note

**All code and UI are currently in Brazilian Portuguese.**

- Variable names, domain logic, and copy use Portuguese terms
- A glossary is available in the documentation
- The architecture is standard Next.js + Supabase + Stripe, making it easy to adapt/translate

### Quick Glossary

| Portuguese | English |
|------------|---------|
| diário | journal/diary |
| oráculo | oracle (AI coach) |
| usuária | user (female) |
| profissional | professional |
| clareza | clarity |
| risco | risk |

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **End User** | Person who journals, tracks episodes, sees risk indicators |
| **Professional** | Psychologist/therapist who monitors patient cases |
| **Admin** | Manages platform, configures AI, monitors metrics |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** (App Router) | Frontend + API Routes |
| **TypeScript** | Static typing |
| **Supabase** | Database (Postgres) + Auth + RLS |
| **Stripe** | Billing and subscriptions |
| **OpenAI / Anthropic** | AI integration |
| **Tailwind CSS** | Styling |
| **Vercel** | Deployment |
| **Playwright** | E2E Testing |

---

## 📊 Current Project Status

### ✅ Implemented (97%)

| Module | Status |
|--------|--------|
| Authentication (login/signup/recovery) | ✅ 100% |
| Journal with risk detection | ✅ 100% |
| User dashboard | ✅ 100% |
| Risk alert system | ✅ 100% |
| Oracle (AI Coach) | ✅ 100% |
| Clarity Test | ✅ 100% |
| Admin Panel | ✅ 100% |
| Billing/Plans (Stripe) | ✅ 90% |
| Dynamic Landing Page | ✅ 95% |
| SaaS Generator (multi-tenant) | ✅ 100% |
| E2E Tests (Playwright) | ✅ 90% |

### 🔧 Minor Pending Items

1. Configure real Stripe `price_id` (environment variables)
2. Run FanPage content seed in Supabase

---

## 📦 What's Included in the Sale

- ✅ **Complete source code** (Next.js + Supabase + Stripe + AI)
- ✅ **Extensive documentation** (40+ .md/.txt files)
- ✅ **Audited AI prompts** (Oracle, risk detection)
- ✅ **Database scripts** (migrations, seeds)
- ✅ **E2E tests** (Playwright configured)
- ✅ **Deployment configured** (Vercel)
- ✅ **"Radar Narcisista" brand** (optional, negotiable)

### Internal Documentation Included

- `HISTORICO-UNIFICADO.txt` – Complete decision history
- `FUTURO-TERMINAR-IMPLEMENTACAO.txt` – Detailed roadmap
- `AUDITORIA-MASTER-PREMIUM.txt` – Complete technical audit
- `ATLAS-RADAR-NARCISISTA.txt` – Architectural vision
- `PROMPTS-MESTRES-RADAR.txt` – Calibrated AI prompts
- 40+ specification documents, manuals, and guides

---

## 🚀 Possible Directions for Buyer

1. **Launch as B2C SaaS** focused on abusive relationships
2. **Generalize** to "emotional clarity" or "relationship health"
3. **Whitelabel for clinics/NGOs** (multi-tenant architecture ready)
4. **Use as boilerplate** for mental health SaaS with AI
5. **License to professionals** (psychologists, coaches)

---

## 💻 How to Run Locally

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Stripe account (test mode)
- OpenAI or Anthropic API key

### Installation

```bash
# Clone repository
git clone https://github.com/edueduardo/radar-narcisista.git
cd radar-narcisista

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run in development
npm run dev
```

Access: http://localhost:3000

### Environment Variables

See `.env.example` for the complete list. Main ones:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
```

---

## 💰 Monetization Status

- **Stage**: Pre-revenue (MVP ready, not commercially launched)
- **Planned model**: Monthly/annual subscriptions (4 plans)
- **Additional potential**: B2B licensing, whitelabel, services

---

## 📄 License

This project is **PROPRIETARY** (All Rights Reserved).

See `LICENSE-RADAR-ASSET.txt` for details.

The repository is public only for evaluation by potential buyers.

---

## 📞 Contact for Acquisition

Interested in acquiring, licensing, or partnering?

- **Name**: Eduardo
- **Email**: [YOUR_EMAIL_HERE]
- **GitHub**: https://github.com/edueduardo
- **Location**: Brazil (BRT timezone)

---

## 📚 Additional Guides

- [Online Demo Guide](docs/DEMO-GUIDE.md)
- [Developer Setup Guide](docs/DEV-SETUP.md)
- [Asset Data Room](docs/ASSET-DATA-ROOM.md)
- [Admin Manual](docs/MANUAL-ADMIN.md)
- [User Manual](docs/MANUAL-USUARIA.md)
