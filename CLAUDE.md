# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Harper Super sMath!" is being converted from a single-page arithmetic flashcard game into a full children's learning platform (math, typing, drawing, educational games, progress tracking, parent/teacher/school supervision). The project is mid-conversion, currently at the end of **Phase 6 (Drawing & Creativity)** of a 10-phase roadmap: auth, roles/permissions, parent accounts, child profiles, dashboard shells, the curriculum data model + admin CMS, a working math quiz/grading engine, a working typing-practice engine, and a working drawing/tracing engine with a private per-child gallery all exist. Games, rewards/mastery, teacher/school tools, and billing are further out (see phases 7–10 below).

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

### Typing module

`TypingExercise`/`TypingSession` are **deliberately separate from the `Activity`/`Question` math engine**, per the product spec's own DB schema — typing is continuous free-text input graded by WPM/accuracy/per-character stats, not discrete right/wrong answers, so it doesn't fit `QuestionGrader`'s model. It still hangs off the same `Lesson` (a Lesson can have `activities` and/or `typingExercises` — e.g. the seeded "Typing" subject's lesson has only a `TypingExercise`, no `Activity`). Visibility uses the same `Lesson::scopePubliclyAvailable()` gate as math content.

`App\Services\TypingGrader::grade(targetText, typedText, elapsedSeconds)` is the sole grading authority: accuracy = exact character match up to the shorter of the two strings, WPM = `(typed chars / 5) / elapsed minutes` (standard convention: 5 characters = 1 "word"), and `key_stats` (per-character attempt/correct counts) is what "progress by key" reporting will eventually read from — don't recompute any of this client-side and trust it.

**The play flow is architecturally different from the math engine, and that's intentional.** Math is a server round trip per question (`ActivityPlayController`); a typing exercise is one continuous client-side interaction — you cannot do a network request per keystroke. `resources/js/Pages/Child/TypingPlay.tsx` captures the whole attempt in React state (`typedText`, `startTime`) and only talks to the server once, via `POST .../complete`, when the exercise finishes (or a `time_limit_seconds` countdown expires). If you add features here, keep that boundary — don't try to make typing grade per-keystroke server-side.

`resources/js/Components/VirtualKeyboard.tsx` highlights the next expected character; it only knows about lowercase letters, digits, and space — punctuation/shift state isn't modeled, matching the current `target_text` content the CMS actually authors (letters/words/sentences, not symbols).

### Drawing module

`Artwork`/`DrawingPrompt` follow the same split as typing: `DrawingPrompt` is CMS-authored guided content hung off a `Lesson` (trace-the-letter/number/shape today; `coloring_page` is modeled in `App\Enums\DrawingPromptType` but deliberately not playable — see below). `Artwork` is what a child actually saves, and it's **not lesson-bound** — free drawing (`/child/draw`) creates an `Artwork` with `drawing_prompt_id = null`, so don't assume every artwork traces back to curriculum content.

**Only `trace_letter`, `trace_number`, and `trace_shape` are playable.** `coloring_page` needs real pre-made line-art image assets to color in — that's a content-authoring problem (someone has to draw/license the artwork), not something more code fixes, so `Child\DrawingPlayController::show()` 404s it and `LessonShow.tsx` shows "Coming soon", the same treatment as the math engine's unplayable question formats and typing's absent sticker/coloring-page asset library.

**`Canvas.tsx` is the one shared drawing engine**, reused by both free draw (`Child/Draw.tsx`) and guided tracing (`Child/DrawingPlay.tsx`) — it takes an optional `templateType`/`templateText` pair and renders that as a faint background *before* the undo/redo history starts recording, so "Clear" and "Undo All" return to the template (or blank canvas), never to something the child can't get back to. It exposes a single imperative `exportImage()` (via `forwardRef`/`useImperativeHandle`) that the parent page calls once, on Save — there's no per-stroke server communication, same reasoning as the typing engine's one-shot submission.

**Known privacy gap, not yet hardened**: saved artwork PNGs live on Laravel's public storage disk (`storage/app/public/artwork/{child_profile_id}/{uuid}.png`, served via the `public/storage` symlink) with UUID filenames, which makes them unlisted/hard to guess but **not actually access-controlled** — anyone with a direct URL can view a file without authentication. This falls short of Section 18's "no public artwork by default" requirement in the strict sense. Treat this the same as the placeholder Terms/Privacy pages: acceptable to ship for local development, but flag it if this app is heading toward a real deployment — the fix is a signed/authenticated streaming route instead of the public disk.

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
- `app/Services/TypingGrader.php` — the only place that should know how to grade a typing attempt (accuracy/WPM/key stats).
- `resources/js/Pages/Child/TypingPlay.tsx` + `resources/js/Components/VirtualKeyboard.tsx` — the one other client-heavy, stateful page besides `Canvas.tsx`/drawing, in an otherwise mostly-server-driven Inertia app; see the Typing module section above for why.
- `resources/js/Components/Canvas.tsx` — the shared drawing engine; see the Drawing module section above before adding a second canvas implementation anywhere.

## Working conventions

- This repo is being built incrementally against a 10-phase roadmap (audit → foundation → curriculum → math → typing → drawing → games → progress/rewards → parent/teacher tools → subscriptions/launch). Foundation, curriculum, mathematics, typing, and drawing (phases 2–6) are done. Don't jump ahead into a later phase's scope (e.g. don't build game engines, the rewards/mastery/streak system, teacher/school tools, or billing) without it being explicitly requested.
- Follow existing patterns before introducing new ones: Form Requests for validation + authorization (`authorize()` calls `$user->can(...)`), Policies for model-level authorization, route-level `role:`/`permission:` middleware for section-level gating.
- Don't hardcode role or permission name strings in more than one place if avoidable — `RoleAndPermissionSeeder` is the source of truth for what roles/permissions exist.
- Use `docker compose exec laravel.test ...` for all artisan/composer/npm commands — nothing runs on the host.
