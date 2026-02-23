# 🛠 ZARISH HEALTH HIS: Configuration Templates

This guide provides **copy-paste templates** for non-coders to manage the system directly through the **Supabase Dashboard**. No coding is required!

---

## 📋 Table of Contents
1. [Staff & User Management](#1-staff--user-management)
2. [Facility Management](#2-facility-management)
3. [Program Configuration](#3-program-configuration)
4. [Customizing Dropdowns & Options](#4-customizing-dropdowns--options)

---

## 1. Staff & User Management
To add or update staff, use the `user_roles` table in Supabase.

### Template: Adding a New Staff Member
| Field | Value (Example) | Description |
| :--- | :--- | :--- |
| `user_id` | `a1b2c3d4...` | Get this from the **Authentication** tab after creating the user. |
| `role` | `hp_doctor` | Options: `hp_doctor`, `hp_nurse`, `ho_chw`, `admin`, `super_admin`. |
| `program` | `HP` | Options: `HP` (Health Post), `HO` (Outreach), `HSS` (Support). |
| `facility_id` | `fac_001` | (Optional) The ID of the clinic they are assigned to. |

---

## 2. Facility Management
To add a new clinic or outreach center, use the `facilities` table.

### Template: Adding a New Facility
| Field | Value (Example) | Description |
| :--- | :--- | :--- |
| `name` | `Kutupalong HP-1` | The name of the facility. |
| `type` | `HP` | Options: `HP`, `HO`, `HSS`. |
| `location` | `Camp 1W` | The physical location or camp name. |
| `status` | `active` | Options: `active`, `inactive`. |

---

## 3. Program Configuration
The system behavior changes based on the **Program** assigned to a user.

### Program Types Reference
- **HP (Health Post)**:
  - Focus: Clinical encounters, NCD screening, Pharmacy.
  - Users: Doctors, Nurses, Pharmacists.
- **HO (Home Outreach)**:
  - Focus: Home visits, Community follow-ups, Referrals.
  - Users: CHWs (Community Health Workers), Outreach Nurses.
- **HSS (Health System Support)**:
  - Focus: Management, Data analysis, System settings.
  - Users: Managers, Data Officers.

---

## 4. Customizing Dropdowns & Options
If you need to change clinical options (like medication lists or diagnosis codes), you can do so in the `clinical_config` table (if available) or by updating the SQL migrations.

### Template: Updating Medication List
To add a new medication, run this in the **SQL Editor**:
```sql
-- Example: Adding a new medication to the system
INSERT INTO medications (name, category, unit)
VALUES ('Amlodipine 5mg', 'Antihypertensive', 'Tablet');
```

---
*Need help? Contact your technical lead or refer to the [SETUP_GUIDE.md](SETUP_GUIDE.md).*
