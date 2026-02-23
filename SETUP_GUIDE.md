# ZARISH HEALTH HIS v3: Comprehensive Setup & Management Guide (Non-Coder Friendly)

This guide is designed for administrators and managers who are not developers. It provides **step-by-step instructions** on how to set up and manage the ZARISH HEALTH Hospital Information System (HIS) from scratch.

---

## 📋 Table of Contents
1. [Database Setup (Supabase)](#1-database-setup-supabase)
2. [Managing Staff & User Roles](#2-managing-staff--user-roles)
3. [Configuring Facilities & Programs](#3-configuring-facilities--programs)
4. [Application Deployment](#4-application-deployment)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Database Setup (Supabase)
The system uses **Supabase** as its database and authentication provider.

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com/) and sign in.
2. Click **New Project** and select your organization.
3. Name your project (e.g., `ZARISH-HEALTH-HIS`) and set a secure database password.
4. Choose a region (e.g., Mumbai or Singapore for Bangladesh).

### Step 2: Run Database Migrations
1. In your Supabase dashboard, go to the **SQL Editor** (the `>_` icon on the left).
2. Click **New Query**.
3. Open the folder `/supabase/migrations/` in this repository.
4. Copy and paste the content of each SQL file into the Supabase SQL Editor and click **Run**.
   - **Important**: Run them in numerical order (001, 002, ..., 019).
   - *Note*: Files 007, 008, and 009 are critical for the new v3 features.

### Step 3: Get Your API Keys
1. Go to **Project Settings** > **API**.
2. Copy the **Project URL** and the **anon public** key.
3. You will need these for the application configuration.

---

## 2. Managing Staff & User Roles
The system uses **Role-Based Access Control (RBAC)** to ensure staff only see what they need.

### How to Add a New Staff Member
1. Go to the **Authentication** tab in Supabase.
2. Click **Add User** > **Create New User**.
3. Enter the staff member's email and a temporary password.
4. Once the user is created, copy their **User ID** (a long string of letters and numbers).

### How to Assign a Role and Program
1. Go to the **Table Editor** in Supabase.
2. Find the `user_roles` table.
3. Click **Insert Row**.
4. Fill in the following:
   - `user_id`: Paste the User ID you copied earlier.
   - `role`: Choose from `hp_doctor`, `hp_nurse`, `ho_chw`, `admin`, etc.
   - `program`: Enter `HP`, `HO`, or `HSS`.
   - `facility_id`: (Optional) Enter the ID of the facility they work at.

---

## 3. Configuring Facilities & Programs
You can manage your clinics and outreach programs directly in the database.

### Adding a Facility
1. In the Supabase **Table Editor**, go to the `facilities` table.
2. Click **Insert Row**.
3. Enter the facility name, type (e.g., `HP`, `HO`), and location.

### Managing Programs
The system supports three main programs:
- **HP (Health Post)**: For clinical care within a facility.
- **HO (Home Outreach)**: For community-based care and home visits.
- **HSS (Health System Support)**: For management and technical support.

---

## 4. Application Deployment
To make the application accessible to staff, you need to host it online.

### Option A: Vercel (Recommended for ease of use)
1. Create a free account on [Vercel](https://vercel.com/).
2. Connect your GitHub repository.
3. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`: (Your Supabase Project URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
4. Click **Deploy**. Vercel will give you a link (e.g., `zarish-health.vercel.app`) that staff can use to log in.

---

## 5. Troubleshooting
- **Login Fails**: Ensure the user has a row in the `user_roles` table.
- **Missing Features**: Check if the user is assigned to the correct **Program** (HP, HO, or HSS).
- **Data Not Showing**: Ensure you have run all the SQL migrations in the Supabase SQL Editor.

---
*For technical support, please contact your IT administrator.*
