# ZARISH HEALTH Hospital Information System (HIS)

ZARISH HEALTH HIS is a production-ready, cloud-native Hospital Information System designed to provide high-quality care to both Bangladeshi citizens and the Rohingya refugee population.

## 🚀 Vision
A serverless, cost-effective, and decentralized health infrastructure providing specialized NCD (Non-Communicable Disease) care across all facility types.

## 🛠 Tech Stack
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Deployment**: Firebase Hosting / GitHub Pages
- **Design**: shadcn/ui with a custom medical theme

## ✨ Key Features
- **Patient Management**: Specialized registration for Bangladeshi (NID) and Rohingya (FCN/Progress ID) populations.
- **NCD Program**: Longitudinal tracking for Hypertension and Diabetes.
- **Clinical Decision Support**: Embedded WHO/ISH protocols and BP/BMI alerts.
- **Admin Wizard**: Multi-step CSV import for legacy patient data.
- **Facility Management**: Supports HP (Health Post), HO (Outreach), and NCD specialized centers.

## 📦 Project Structure
```text
src/
├── apps/               # Application Portals
│   ├── auth/           # Login & Authentications
│   ├── provider-portal/ # Clinical workflow for doctors/nurses
│   └── admin-portal/   # System administration & Reports
├── shared/             # Shared logic across portals
│   ├── components/     # UI Design System
│   ├── hooks/          # Data & Auth logic
│   ├── lib/            # External integrations (Supabase)
│   ├── stores/         # State management (Zustand)
│   └── types/          # TypeScript definitions
└── styles/             # Global CSS & Tailwind theme
```

## ⚙️ Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy migrations: Use the SQL in `/supabase/migrations/` in your Supabase SQL Editor.
5. Run locally: `npm run dev`

---
*Built with ❤️ by Antigravity for ZARISH HEALTH.*
