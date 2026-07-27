# METLAS ERP Project Memory

## Project Purpose

METLAS ERP is a professional, modern, multi-tenant SaaS ERP for Turkish bottled-water distributors and delivery companies. It is intended to scale from one company and 4-5 users to thousands of companies on shared infrastructure.

## Current Goals

- Manage orders, customers, vehicles, and daily operations digitally.
- Build toward multi-branch, dealership, mobile courier, WhatsApp, online ordering, and reporting capabilities.
- Preserve a production-grade foundation for a future SaaS platform where each tenant sees only its own data.

## Architecture

- Frontend: Next.js App Router, TypeScript, React, TailwindCSS.
- Backend: Next.js API Routes, Prisma ORM.
- Database: PostgreSQL on Neon Cloud.
- Authentication: NextAuth Credentials Provider ve JWT session.
- Validation: Zod.
- Forms: React Hook Form.
- Tables: TanStack Table.

## Current State

- Next.js, TypeScript, TailwindCSS, Prisma, and Neon are configured.
- Dashboard and responsive sidebar are implemented.
- Customer and Order modules are complete.
- Database, Neon, GitHub, deployment infrastructure, and OpenCode are active.
- Build and lint are working.
- Prisma generate is working.
- Home and office development environments are synchronized.

## Planned Modules

Product, Vehicle, Personnel, Delivery, Cash, Expenses, Suppliers, Reports, Settings, Role Management, Notification System, Audit Logs, and System Management.

## Future Integrations

QR codes, barcodes, mobile courier, maps, GPS, online payments, WhatsApp, SMS, e-Fatura, e-Arşiv, e-İrsaliye, Logo, Mikro, Nebim, APIs, webhooks, multi-language, and multi-currency.

## Engineering Principles

- Analyze the existing architecture before coding.
- Plan before implementation and minimize the affected files.
- Preserve the working system and avoid temporary or shortcut solutions.
- Prefer readable, reusable, modular, scalable, production-grade code.
- Avoid duplicated logic, dead code, unnecessary abstractions, and unnecessary file changes.
- Apply SOLID principles where they improve the design.
- Preserve migrations and design for tenant isolation and future scale.
- Use existing component and UI primitives rather than rebuilding stable primitives.

## UI Principles

- Modern, minimal, professional, fast, responsive, and enterprise-oriented.
- Maintain consistent colors, cards, spacing, hierarchy, and component patterns.
- Treat mobile experience as equally important to desktop.
- Prioritize accessibility, keyboard navigation, semantic HTML, visible focus, correct ARIA, contrast, and reduced motion.
- On mobile screens below the `md` breakpoint, dense tables should become readable card/tile layouts.
- Mobile cards must fit their content, avoid horizontal overflow, preserve hierarchy, and keep actions touch-friendly.
- Desktop/web layouts at `md` and above must remain unchanged unless explicitly requested.

## Required Workflow

1. Analyze the current structure.
2. Plan the change.
3. List affected files.
4. Identify risks.
5. Implement with minimum impact.
6. Run lint.
7. Run build.
8. Fix failures.
9. Report the result.
10. Commit and push only after user approval.

## Git Policy

- GitHub and the `main` branch are used.
- Every completed development should be reviewed and verified.
- Do not commit or push without explicit user approval.

## Product Standard

This is a commercial product. The goal is not merely to make features work, but to build a scalable, maintainable, professional ERP that can serve thousands of tenants for many years.
