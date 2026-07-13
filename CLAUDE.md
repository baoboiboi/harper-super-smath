# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Harper Super sMath!" is being converted from a single-page arithmetic flashcard game into a full children's learning platform (math, typing, drawing, educational games, progress tracking, parent/teacher/school supervision). The project is mid-conversion, currently at the end of **Phase 4 (Mathematics)** of a 10-phase roadmap: auth, roles/permissions, parent accounts, child profiles, dashboard shells, the curriculum data model + admin CMS, and a working child-facing quiz/grading engine all exist. Typing, drawing, games, rewards/mastery, teacher/school tools, and billing are further out (see phases 5–10 below).

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

### Curriculum data model

The content hierarchy is `Subject → Skill (× GradeLevel) → Course → Unit → Lesson → Activity → Question → QuestionOption`, matching the product spec's learning-path structure. All nine tables live in `database/migrations/2026_07_13_0519*`. Notes:

- `Course`, `Unit`, and `Lesson` carry a `status` column cast to the `App\Enums\ContentStatus` enum (`draft` / `under_review` / `published` / `archived`). Because MySQL's column `default('draft')` isn't reflected on an in-memory model until it's reloaded, these three models also set a PHP-level `protected $attributes = ['status' => 'draft', ...]` — don't remove that when touching these models, or `new Course()->status` will be `null` instead of the enum before the first save.
- `Activity.type` and `Question.type` both use `App\Enums\QuestionFormat` (the ten formats from the product spec: multiple_choice, number_input, drag_drop, match_pairs, sort, select_image, fill_blank, visual_counting, timed_challenge, word_problem). Choice-based formats store correctness via `QuestionOption.is_correct`; other formats use `Question.correct_answer` (a flexible JSON column, `{"value": ...}`, interpreted by `App\Services\QuestionGrader` — see the Mathematics engine section below for which formats are actually playable today).
- Slugs (`Subject`, `GradeLevel`, `Skill`, `Course`, `Unit`, `Lesson`) are auto-generated and de-duplicated by `app/Models/Concerns/HasSlug.php` on create — never accept `slug` as user input in a form.
- Deleting a `Subject`/`Skill`/`Course`/`Unit`/`Lesson` cascades down the whole hierarchy (FK `cascadeOnDelete`) — the admin UI confirms this in its delete prompts; don't add soft-deletes here without reconsidering that cascade.

### Admin curriculum CMS

`app/Http/Controllers/Admin/Curriculum/*` + `resources/js/Pages/Admin/Curriculum/*`, gated by the `admin.manage-curriculum` permission (route group in `routes/web.php`). Subjects/GradeLevels/Skills/Courses/Units/Lessons are flat list-plus-modal CRUD pages (parent entities referenced via a `<select>`, not a nested drill-down UI). Lessons additionally link to `LessonEditor.tsx`, a dedicated page for managing a lesson's Activities → Questions → Options inline — that's the one deeply-nested editing surface in the CMS; don't try to replicate the modal-CRUD pattern for those three levels, the nesting doesn't fit it.

### Mathematics engine (child-facing play)

`app/Http/Controllers/Child/{SubjectController,LessonController,ActivityPlayController}.php` + `resources/js/Pages/Child/{Subjects,SubjectLessons,LessonShow,ActivityPlay}.tsx`. Only `published` lessons whose unit *and* course are also `published` are ever visible to a child — enforced by `Lesson::scopePubliclyAvailable()`, which every child-facing query and `ActivityPlayController::ensureAvailable()` goes through. Never bypass that scope with a raw `Lesson::find()` in child-facing code.

**Not every question format is playable yet.** `App\Services\QuestionGrader::isPlayable()` covers `multiple_choice`, `select_image`, `visual_counting`, `number_input`, `fill_blank`, and `word_problem` — the formats that fit the current schema (choice correctness on `QuestionOption.is_correct`, or a value compared against `Question.correct_answer['value']`). `drag_drop`, `match_pairs`, `sort`, and `timed_challenge` are authorable in the CMS but intentionally not playable yet (`ActivityPlayController` 404s them; `LessonShow.tsx` shows "Coming soon" instead of a Play button) — they need real interaction models (ordering/pairing/timing), not just a grading tweak, before they can be turned on.

**Attempt resolution is the trickiest part of this code — read before changing it.** `ActivityAttempt` records are per `(child_profile_id, activity_id)`. `ActivityPlayController` has three ways of picking "the" attempt, and they are not interchangeable:
- `activeIncompleteAttempt()` — the in-progress attempt, if any (`completed_at IS NULL`).
- `resolveAttemptForShow()` — used by `show()` (GET): prefers an incomplete attempt (resume); otherwise shows the most recently *completed* attempt's summary; otherwise starts a new one. A `?retry=1` query param (used by LessonShow's "Play Again" link) skips reusing the completed attempt and forces a fresh one.
- `startNewAttempt()` — used directly by `answer()` (POST) when there's no incomplete attempt, so a stray POST without a prior GET still works.

The reason `show()` can't simply "find or create": a naive find-or-create-incomplete-else-new means reloading the play page *after finishing* silently starts a brand-new attempt instead of showing the just-completed summary — that was a real bug caught by `MathematicsEngineTest::test_activity_attempt_completes_after_all_questions_answered` during development. If you touch this logic, re-run that test.

**Feedback is a one-request session flash, not stored state.** `answer()` grades the submission, writes a `QuestionAttempt`, and flashes `session('feedback')` before redirecting back to the *same* `show()` route. The next GET renders the feedback screen (checked before anything else in `show()`); the GET after *that* — once the flash has aged out — renders the next question or the summary. Don't try to pass feedback as a normal prop; the redirect-then-flash round trip is what lets the browser URL stay on the `play` route through the whole flow.

Answer options are shuffled server-side per request and only `{id, label}` is sent to the client — never `is_correct` or `value`, which would let a child inspect the network tab to cheat.

### Audit logging

`AuditLog::record(string $action, ?Model $subject, array $metadata, ?User $user)` is a static helper that writes to the polymorphic `audit_logs` table. Call it at points that change account/access state (see `ChildProfileController` and `Admin\UserManagementController` for examples) rather than adding ad hoc logging elsewhere.

### Directory structure of note

- `app/Http/Controllers/Parent/`, `Child/`, `Admin/` — role-scoped controllers, namespaced accordingly (`App\Http\Controllers\Parent\DashboardController`, etc.)
- `resources/js/Layouts/PublicLayout.tsx` — marketing/public pages nav+footer
- `resources/js/Layouts/ChildLayout.tsx` — minimal, large-button child-facing chrome (no admin nav, "Switch Profile" exit). Reads the active child from the `activeChild` prop shared globally by `HandleInertiaRequests::share()` (session-derived) — don't pass a `childName`/`childProfile` prop into it, it doesn't take one.
- `resources/js/Layouts/AuthenticatedLayout.tsx` — Breeze default, reused for Parent and Admin dashboards
- `resources/js/Layouts/AdminCurriculumLayout.tsx` — wraps `AuthenticatedLayout` with the Subjects/Grade Levels/Skills/Courses/Units/Lessons sub-nav; use it for any new curriculum admin page
- `resources/js/Pages/Public/*` — one component per public route in `routes/web.php` (Home, About, HowItWorks, Subjects, Pricing, Safety, Faq, Contact, Terms, Privacy); content is static placeholder copy pending real content/legal review
- `resources/js/Components/Card.tsx`, `EmptyState.tsx` — shared alongside Breeze's existing `PrimaryButton`/`Modal`/`TextInput`/etc.
- `app/Services/QuestionGrader.php` — the only place that should know how to grade a `Question`; don't duplicate its choice-vs-value branching logic elsewhere.

## Working conventions

- This repo is being built incrementally against a 10-phase roadmap (audit → foundation → curriculum → math → typing → drawing → games → progress/rewards → parent/teacher tools → subscriptions/launch). Foundation, curriculum, and mathematics (phases 2–4) are done. Don't jump ahead into a later phase's scope (e.g. don't build typing/drawing/game engines, the rewards/mastery/streak system, teacher/school tools, or billing) without it being explicitly requested.
- Follow existing patterns before introducing new ones: Form Requests for validation + authorization (`authorize()` calls `$user->can(...)`), Policies for model-level authorization, route-level `role:`/`permission:` middleware for section-level gating.
- Don't hardcode role or permission name strings in more than one place if avoidable — `RoleAndPermissionSeeder` is the source of truth for what roles/permissions exist.
- Use `docker compose exec laravel.test ...` for all artisan/composer/npm commands — nothing runs on the host.
