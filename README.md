# ZARISH HEALTH Hospital Information System (HIS) v3

ZARISH HEALTH HIS is a production-ready, cloud-native Hospital Information System designed to provide high-quality care to both Bangladeshi citizens and the Rohingya refugee population. **Version 3** introduces multi-program support and cross-program coordination.

## 🚀 Vision
A serverless, cost-effective, and decentralized health infrastructure providing specialized NCD (Non-Communicable Disease) care across all facility types (HP, HO, HSS).

## 🛠 Tech Stack
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Deployment**: Firebase Hosting / GitHub Pages
- **Design**: shadcn/ui with a custom medical theme

## ✨ Key Features (v3)
- **Multi-Program Support**: Specialized workflows for **HP** (Health Post), **HO** (Home Outreach), and **HSS** (Health System Support).
- **Cross-Program Coordination**: Integrated referral system, home visit tracking, and missed appointment follow-ups.
- **Role-Based Access Control (RBAC)**: Granular permissions for Doctors, Nurses, CHWs, Pharmacists, and Administrators.
- **Patient Management**: Specialized registration for Bangladeshi (NID) and Rohingya (FCN/Progress ID) populations.
- **NCD Program**: Longitudinal tracking for Hypertension and Diabetes with WHO/ISH protocols.
- **Admin Dashboard**: Advanced reporting, facility management, and CSV data import tools.

## 📦 Project Structure
```text
src/
├── apps/               # Application Portals
│   ├── auth/           # Login & Authentications
│   ├── provider-portal/ # Clinical workflow for doctors/nurses
│   ├── admin-portal/   # System administration & Reports
│   └── coordination/   # Cross-program referral & follow-up tools
├── routes/             # Program-specific routing (HP, HO, HSS, etc.)
├── shared/             # Shared logic across portals
│   ├── components/     # UI Design System
│   ├── hooks/          # Data & Auth logic
│   ├── lib/            # External integrations (Supabase)
│   ├── stores/         # State management (Zustand)
│   └── types/          # TypeScript definitions
└── styles/             # Global CSS & Tailwind theme
```

## ⚙️ Quick Setup (For Non-Coders)
If you are not a developer, please follow our **[Simplified Setup & Management Guide](SETUP_GUIDE.md)**. It contains step-by-step instructions on:
1. Setting up your Supabase database.
2. Adding and managing staff accounts.
3. Configuring facilities and programs.
4. Deploying the application.

## 🛠 Developer Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy migrations: Run all SQL files in `/supabase/migrations/` in your Supabase SQL Editor in numerical order.
5. Run locally: `npm run dev`.

---
*Built with ❤️ for ZARISH HEALTH.*
