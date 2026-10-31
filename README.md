# Brightloop Subscription Management System (BSMS)

> Enterprise-grade financial & operational backbone for subscription lifecycle management, recurring billing automation, idempotent invoicing, automated dunning recovery, and SaaS metric telemetry.

Built strictly according to the **Brightloop Subscription Management System (BSMS) Product Requirements Document (PRD)**.

---

## ⚡ Quick Start & Running the Application

### 1. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3001)** in your browser.

### 2. Database Synchronization & Seeding (Pre-configured)
The database has already been initialized and populated with comprehensive enterprise demo data:
```bash
npm run prisma:push    # Sync schema to SQLite (dev.db) / PostgreSQL
npm run prisma:seed    # Seeds users, products, variants, plans, subscriptions, invoices, and chatter
```

---

## 🔐 Demo Credentials & Role Access (RBAC)

The system includes pre-configured accounts with instant 1-click login buttons on the `/login` screen:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@brightloop.com` | `Admin@123!` | Full control across all financial, catalog, staff & billing settings. |
| **Sales / Ops Staff** | `sales@brightloop.com` | `Staff@123!` | Quotation builder, subscription lifecycle state transitions, invoice runs. |
| **Finance Lead** | `finance@brightloop.com` | `Finance@123!` | SaaS Metrics Cockpit, cash reconciliation, dunning queue, AR tracking. |
| **Customer Portal** | `alex@acmecorp.com` | `Customer@123!` | Customer self-service portal, view active plans, pay invoices online, PDF download. |

*(All passwords meet FR-1.1: >8 chars, uppercase, lowercase, and special character `!@#$%^&*`)*.

---

## 🏗️ Architecture & Technology Stack

* **Frontend:** Next.js 14 (App Router, Server & Client Components) with TypeScript.
* **Styling & UI:** Tailwind CSS with Lucide React Icons.
* **Backend:** Next.js Route Handlers & Server Actions.
* **Database & ORM:** Prisma ORM with SQLite for immediate local execution (`prisma/schema.prisma`) and PostgreSQL schema for production (`prisma/schema.postgresql.prisma`).
* **Document Generation:** Direct PDF invoice generation engine (`jspdf`, `jspdf-autotable`).
* **Charts & Cockpit:** Recharts (Area charts for MRR trajectory, Bar charts for debt aging).
* **Authentication:** JWT & Bcrypt password hashing with role-based session middleware.

---

## 🚀 Standout Features Implemented (PRD Section 5)

### 1. SF-1: Interactive Shareable Quotation & 1-Click Buy (`/quote/[token]`)
* Sales reps build quotes and generate time-limited signed public URLs.
* Clients open `/quote/[token]`, inspect itemized lines, **toggle optional feature variants live** (with real-time recalculation of prices, tax, and totals), digitally sign, and convert the quote directly into an **ACTIVE Subscription**.
* Verified demo quote link: `http://localhost:3000/quote/quote-tok-stark-2026-abc89f`

### 2. SF-2: ERP-Style Audit Log & Activity "Chatter" (`ActivityChatter.tsx`)
* Embedded timeline on Subscription and Invoice detail pages.
* Automatically records:
  - State changes (`Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed`)
  - Discount voucher applications
  - Automated recurring invoice generation runs
  - Dunning notices and automated service suspensions
  - Payment receipts
* Includes an interactive notes composer for internal staff to log phone calls or memos.

### 3. SF-3: Automated Dunning Engine (Overdue Recovery) (`/dunning`)
* Multi-stage automated recovery sequence triggered via `/api/dunning/run` or the top action bar:
  - **Day 3 Past Due:** Friendly automated reminder email dispatched (Stage 1).
  - **Day 7 Past Due:** Urgent notice with direct payment gateway link sent; flagged in staff cockpit (Stage 2).
  - **Day 14 Past Due:** System flips subscription status to **`PAUSED`** (service suspended to protect capital) (Stage 3).
  - **Auto-Reactivation:** Once payment is registered against the invoice, any associated paused subscription **automatically resumes to `ACTIVE`**!

### 4. SF-4: SaaS Metrics Cockpit (`/metrics`)
* Executive financial intelligence screen calculating:
  - **MRR (Monthly Recurring Revenue)** & **ARR (Annual Recurring Revenue)**
  - **ARPU (Average Revenue Per User)** = $\frac{\text{Total MRR}}{\text{Active Subscriptions}}$
  - **Monthly Churn Rate (%)**
  - **Overdue Collections Queue:** Total capital at risk categorized into aged debt buckets (1–7 days, 8–14 days, 15+ days).

---

## 📱 Complete 17-Screen Catalog

1. **Screen 1 - Authentication Hub (`/login`, `/signup`, `/forgot-password`):** One-click demo profile logins, live password policy validator checklist (FR-1.1), and tokenized password reset links.
2. **Screen 2 - Executive Dashboard (`/dashboard`):** Real-time KPI tiles (Active Subs, MRR, Overdue Capital, Paused Accounts), quick action launchpad, and live ERP event feed.
3. **Screen 3 - SaaS Metrics Cockpit (`/metrics`):** Interactive MRR trajectory charts, ARPU, churn benchmarks, and aged debt distribution.
4. **Screen 4 - Subscriptions List Screen (`/subscriptions`):** Filterable table with contextual three-dot (`⋮`) actions (Pause, Resume, Generate Invoice, Copy Public Quote Link, Cancel).
5. **Screen 5 - Subscription Detail Screen (`/subscriptions/[id]`):** Interactive lifecycle status ribbon (`Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed`), customer profile, lines table, and bottom ERP Chatter.
6. **Screen 6 - Quotation Builder (`/quotes/new`):** Customer selector, plan selector, dynamic line items builder with variant price adjustments, discount vouchers, and "Generate Share Link" action.
7. **Screen 7 - Public Shareable Quote View (`/quote/[token]`):** Branded public view for prospects with live variant toggles and digital signature acceptance.
8. **Screen 8 - Invoices List Screen (`/invoices`):** Filterable by status (`DRAFT`, `CONFIRMED`, `PAID`, `OVERDUE`), "Run Automated Billing Job" button, and payment actions.
9. **Screen 9 - Invoice Detail Screen (`/invoices/[id]`):** Official printable invoice sheet with tax breakdown, payment history, and one-click PDF download.
10. **Screen 10 - Register Payment Modal (`/invoices/[id]/payment`):** Payment method selector, amount input, transaction memo, and automatic subscription resumption upon settlement.
11. **Screen 11 - Dunning & Overdue Tracker (`/dunning`):** Aging debt buckets (1–7d, 8–14d, 15+d), automated dunning run trigger, and manual reminder dispatch.
12. **Screen 12 - Product & Variant Configurator (`/admin/products`):** Product catalog management with gross margin tracking and custom variant price deltas (e.g. +$560 for Odoo Brand).
13. **Screen 13 - Plan Management Screen (`/admin/plans`):** Frequency configuration (Daily, Weekly, Monthly, Yearly), pause capability, and auto-renew policy toggles.
14. **Screen 14 - Discount & Tax Settings (`/admin/settings`):** Rules engine for promotional codes (% or $) and regional tax rates.
15. **Screen 15 - Staff Management (`/admin/staff`):** Admin portal to provision staff accounts with strict password validation.
16. **Screen 16 - Customer Portal Home (`/portal`):** Overview of active subscriptions, renewal dates, and plan change request triggers.
17. **Screen 17 - Customer Invoices & Online Payments (`/portal/invoices`):** Customer view of invoices with instant PDF downloads and online payment checkout.

---

## 🛡️ Transactional Idempotency & Billing Integrity (FR-4.2 & NFR-3)

The automated billing engine (`src/lib/billing-engine.ts`) runs within atomic transactions (`prisma.$transaction`) and computes an execution cycle key `(subscription_id, billing_period)`. If an invoice has already been generated for the current cycle, the engine skips duplicate generation to guarantee zero duplicate billing.

