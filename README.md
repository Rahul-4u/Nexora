# Nexora — Full-Stack Digital Agency Website & Multi-Tenant CRM Platform

Nexora combines a **Webtec-faithful public digital agency website** with a complete, multi-tenant **CRM, CMS, Project Management, HR, Recruitment, and Finance** platform built on Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL.

---

## Architecture & Modules

- **Public Website (`src/app/(public)/*`)**:
  - **Home (`/`)**: Faithful reproduction of the Webtec design system (navy-to-crimson hero, floating stats cards, About funnel & progress bar, dark rounded How It Work + 4-row Services showcase, Why Choose Us 2×2 grid, Selected Works portfolio grid, Our Team cards, interactive Testimonials slider, Partner Logos, CRM-connected Send Message form, Latest Blog cards, and dark rounded Newsletter Footer).
  - **Inner Pages**: `/about`, `/services`, `/services/[slug]`, `/portfolio`, `/portfolio/[slug]`, `/team`, `/team/[slug]`, `/blog`, `/blog/[slug]`, `/contact`, `/faq`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, plus dynamic `sitemap.xml` and `robots.txt`.
  - **Light & Dark Themes**: Persisted across sessions without FOUC via `next-themes` and semantic CSS tokens in `src/app/globals.css`.
- **Authentication & Multi-Tenant RBAC (`src/app/(auth)/*`, `src/lib/auth/*`, `src/lib/permissions/rbac.ts`)**:
  - Signed HTTP-only JWT cookies (`jose`), bcrypt password hashing, password reset, email verification, rate limiting, and server-side `organizationId` isolation across 10 roles (`SUPER_ADMIN`, `ORG_ADMIN`, `SALES_MANAGER`, `SALES_REP`, `MARKETING`, `HR_MANAGER`, `FINANCE_MANAGER`, `PROJECT_MANAGER`, `EMPLOYEE`, `CLIENT`).
- **Integrated Business Modules (`src/app/(dashboard)/*`, `src/app/api/*`)**:
  - **CRM**: Executive KPI Dashboard (Recharts), Leads (search, filters, sort, pagination, bulk actions, CSV import/export, Lead Conversion to Contact + Company + Deal), Contacts, Companies, Drag-and-Drop Deals Kanban Pipeline, Activities, Tasks, Calendar & Meetings.
  - **Operations & Finance**: Projects & Milestones, Employees (with public `/team` visibility toggle), HR Attendance/Leave/Work Logs, Recruitment & Public Resume Uploads, Invoices (with `jsPDF` invoice PDF export + payment tracking), Expenses, and Executive Reports.
  - **CMS & Settings**: Manage Services, Portfolio, Blog Posts, Testimonials, FAQs, Media Library, Contact Inbox, Organization Profile, RBAC Role Assignments, and Audit Logs.

---

## Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `DATABASE_URL` to point to your PostgreSQL instance and set a strong `AUTH_SECRET` (32+ characters).

### 2. Start PostgreSQL (Optional Docker)

```bash
docker compose up -d
```

### 3. Run Prisma Migrations & Seed Demo Data

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

### Seeded Demo Accounts (Password: `Nexora@2026!`)

| Role | Email |
| :--- | :--- |
| Super Admin | `admin@nexora.agency` |
| Sales Manager | `sales@nexora.agency` |
| HR Manager | `hr@nexora.agency` |
| Finance Manager | `finance@nexora.agency` |
| Project Manager | `pm@nexora.agency` |
| Marketing | `marketing@nexora.agency` |
| Client | `client@brightlabs.io` |

---

## Testing & Verification

```bash
npx tsc --noEmit     # TypeScript check
npm run lint         # ESLint check
npm test             # Vitest unit & integration tests
npm run build        # Production Next.js build
npm run test:e2e     # Playwright end-to-end tests (requires running app)
```
