# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Harper Super sMath!" is being converted from a single-page arithmetic flashcard game into a full children's learning platform (math, typing, drawing, educational games, progress tracking, parent/teacher/school supervision). The project is mid-conversion, currently at the end of **Phase 2 (Foundation)** of a 10-phase roadmap: auth, roles/permissions, parent accounts, child profiles, and dashboard shells exist; curriculum content, typing, drawing, games, rewards, and billing are not yet built (see phases 3–10 below).

The original static game's source is preserved under `legacy/` (`index.html`, `app.js`, `style.css`, `sounds/`) for reference — it is no longer served by the app. `CNAME` (GitHub Pages, `fli.ink`) is likewise stale: this app requires a PHP + MySQL host and can no longer deploy as a static site as-is.

## Stack

- **Backend**: Laravel 13, PHP 8.4
- **Frontend**: Inertia.js + React + TypeScript, Tailwind CSS
- **Database**: MySQL 8.4
- **Auth/roles**: Laravel Breeze (adult email/password auth) + `spatie/laravel-permission` (RBAC)
- **Local dev environment**: Laravel Sail (Docker) — there is no PHP/Composer/MySQL installed on the host; everything runs in containers.

## Running locally

Docker Desktop must be running. From the repo root:

```bash
docker compose up -d          # start the app + MySQL containers
docker compose exec laravel.test php artisan migrate --force
docker compose exec laravel.test npm run dev    # or: npm run build
```

The app is served at `http://localhost` (port 80). Vite's dev server runs on port 5173 for HMR.

Because this environment doesn't have a Unix shell for Laravel's `./vendor/bin/sail` wrapper script, **use `docker compose` directly** instead of `sail ...` — e.g. `docker compose exec laravel.test php artisan ...`, `docker compose exec laravel.test npm ...`. `WWWUSER`/`WWWGROUP` are hardcoded in `.env` (rather than computed by the `sail` script) for the same reason.

Seeded local accounts (via `php artisan db:seed`, local environment only): `admin@example.com` (super_admin) and `parent@example.com` (parent), password `password`.

## Testing

```bash
docker compose exec laravel.test php artisan test               # full suite
docker compose exec laravel.test php artisan test --filter=Name # single test
```

Tests run against a real MySQL database (`testing`, auto-created by Sail's MySQL container init script), not SQLite — don't assume SQLite-only behavior is safe. Run `npm run build` (runs `tsc` then `vite build`) to typecheck and catch frontend build errors; there is no separate `npm run typecheck`.

## Architecture

### Roles and permissions (`spatie/laravel-permission`)

Roles are seeded by `database/seeders/RoleAndPermissionSeeder.php`: `super_admin` (all `admin.*` permissions), six admin sub-roles (`content_admin`, `curriculum_manager`, `customer_support`, `finance_manager`, `school_account_manager`, `technical_admin` — currently only `admin.access`, scoped permissions land as each admin area is built), plus `parent`, `teacher`, `school_admin`. Route-level gating uses Spatie's `role:` / `permission:` middleware aliases (registered in `bootstrap/app.php`, which is where all middleware config lives — this app has no `Kernel.php`).

### Child profiles are not separate accounts

Per the product spec, children don't get email addresses or independent Laravel accounts. A `ChildProfile` (`app/Models/ChildProfile.php`) belongs to a parent `User` and stores a hashed 4-digit PIN (`setPin()`/`checkPin()`, never mass-assignable — see `pin_hash` excluded from `#[Fillable]`). "Logging in" as a child is a **session overlay on top of an authenticated parent session**, not a second auth guard:

1. Parent authenticates normally (Breeze/web guard).
2. Parent selects a child profile and enters its PIN (`ChildSessionController@create`/`store`).
3. On success, `active_child_profile_id` is stored in the session.
4. `EnsureActiveChildProfile` middleware (alias `child.active`) resolves that ID back to a `ChildProfile` scoped to `auth()->user()->id` on every request under `/child/*`, rejecting anything that doesn't match (stale session, suspended profile, wrong parent) by clearing the session key and redirecting to the parent dashboard.
5. `POST /child/exit` clears the session key.

`ChildProfilePolicy` enforces the same ownership rule (`parent_id === $user->id`) for direct model actions (view/update/delete), independent of the session middleware.

### Audit logging

`AuditLog::record(string $action, ?Model $subject, array $metadata, ?User $user)` is a static helper that writes to the polymorphic `audit_logs` table. Call it at points that change account/access state (see `ChildProfileController` and `Admin\UserManagementController` for examples) rather than adding ad hoc logging elsewhere.

### Directory structure of note

- `app/Http/Controllers/Parent/`, `Child/`, `Admin/` — role-scoped controllers, namespaced accordingly (`App\Http\Controllers\Parent\DashboardController`, etc.)
- `resources/js/Layouts/PublicLayout.tsx` — marketing/public pages nav+footer
- `resources/js/Layouts/ChildLayout.tsx` — minimal, large-button child-facing chrome (no admin nav, "Switch Profile" exit)
- `resources/js/Layouts/AuthenticatedLayout.tsx` — Breeze default, reused for Parent and Admin dashboards
- `resources/js/Pages/Public/*` — one component per public route in `routes/web.php` (Home, About, HowItWorks, Subjects, Pricing, Safety, Faq, Contact, Terms, Privacy); content is static placeholder copy pending real content/legal review
- `resources/js/Components/Card.tsx`, `EmptyState.tsx` — shared alongside Breeze's existing `PrimaryButton`/`Modal`/`TextInput`/etc.

## Working conventions

- This repo is being built incrementally against a 10-phase roadmap (audit → foundation → curriculum → math → typing → drawing → games → progress/rewards → parent/teacher tools → subscriptions/launch). Don't jump ahead into a later phase's scope (e.g. don't build curriculum/lesson content, typing/drawing/game engines, or billing) without it being explicitly requested — the foundation phase intentionally leaves those as empty states.
- Follow existing patterns before introducing new ones: Form Requests for validation + authorization (`authorize()` calls `$user->can(...)`), Policies for model-level authorization, route-level `role:`/`permission:` middleware for section-level gating.
- Don't hardcode role or permission name strings in more than one place if avoidable — `RoleAndPermissionSeeder` is the source of truth for what roles/permissions exist.
- Use `docker compose exec laravel.test ...` for all artisan/composer/npm commands — nothing runs on the host.
