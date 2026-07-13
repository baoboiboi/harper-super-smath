<?php

use App\Http\Controllers\Admin\Curriculum\ActivityController;
use App\Http\Controllers\Admin\Curriculum\CourseController;
use App\Http\Controllers\Admin\Curriculum\GradeLevelController;
use App\Http\Controllers\Admin\Curriculum\LessonController;
use App\Http\Controllers\Admin\Curriculum\QuestionController;
use App\Http\Controllers\Admin\Curriculum\QuestionOptionController;
use App\Http\Controllers\Admin\Curriculum\SkillController;
use App\Http\Controllers\Admin\Curriculum\SubjectController;
use App\Http\Controllers\Admin\Curriculum\UnitController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Child\ActivityPlayController;
use App\Http\Controllers\Child\DashboardController as ChildDashboardController;
use App\Http\Controllers\Child\LessonController as ChildLessonController;
use App\Http\Controllers\Child\SubjectController as ChildSubjectController;
use App\Http\Controllers\ChildProfileController;
use App\Http\Controllers\ChildSessionController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicPageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PublicPageController::class, 'home'])->name('home');
Route::get('/about', [PublicPageController::class, 'about'])->name('about');
Route::get('/how-it-works', [PublicPageController::class, 'howItWorks'])->name('how-it-works');
Route::get('/subjects', [PublicPageController::class, 'subjects'])->name('subjects');
Route::get('/pricing', [PublicPageController::class, 'pricing'])->name('pricing');
Route::get('/safety', [PublicPageController::class, 'safety'])->name('safety');
Route::get('/faq', [PublicPageController::class, 'faq'])->name('faq');
Route::get('/contact', [PublicPageController::class, 'contact'])->name('contact');
Route::get('/terms', [PublicPageController::class, 'terms'])->name('terms');
Route::get('/privacy', [PublicPageController::class, 'privacy'])->name('privacy');

Route::get('/dashboard', function () {
    $user = request()->user();

    if ($user->hasRole('parent')) {
        return redirect()->route('parent.dashboard');
    }

    if ($user->can('admin.access')) {
        return redirect()->route('admin.dashboard');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'role:parent'])->prefix('parent')->name('parent.')->group(function () {
    Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');
    Route::post('/children', [ChildProfileController::class, 'store'])->name('children.store');
    Route::delete('/children/{childProfile}', [ChildProfileController::class, 'destroy'])->name('children.destroy');
    Route::get('/children/{childProfile}/enter', [ChildSessionController::class, 'create'])->name('children.enter');
    Route::post('/children/{childProfile}/enter', [ChildSessionController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('children.authenticate');
});

Route::middleware(['auth', 'verified', 'child.active'])->prefix('child')->name('child.')->group(function () {
    Route::get('/dashboard', [ChildDashboardController::class, 'index'])->name('dashboard');
    Route::get('/subjects', [ChildSubjectController::class, 'index'])->name('subjects.index');
    Route::get('/subjects/{subject}', [ChildSubjectController::class, 'show'])->name('subjects.show');
    Route::get('/lessons/{lesson}', [ChildLessonController::class, 'show'])->name('lessons.show');
    Route::get('/activities/{activity}/play', [ActivityPlayController::class, 'show'])->name('activities.play');
    Route::post('/activities/{activity}/answer', [ActivityPlayController::class, 'answer'])->name('activities.answer');
});

Route::middleware(['auth', 'verified'])->post('/child/exit', [ChildSessionController::class, 'destroy'])->name('child.exit');

Route::middleware(['auth', 'verified', 'permission:admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::middleware('permission:admin.manage-users')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    });

    Route::middleware('permission:admin.manage-roles')->group(function () {
        Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.update-role');
    });

    Route::middleware('permission:admin.manage-curriculum')->prefix('curriculum')->name('curriculum.')->group(function () {
        Route::get('/subjects', [SubjectController::class, 'index'])->name('subjects.index');
        Route::post('/subjects', [SubjectController::class, 'store'])->name('subjects.store');
        Route::patch('/subjects/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
        Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

        Route::get('/grade-levels', [GradeLevelController::class, 'index'])->name('grade-levels.index');
        Route::post('/grade-levels', [GradeLevelController::class, 'store'])->name('grade-levels.store');
        Route::patch('/grade-levels/{gradeLevel}', [GradeLevelController::class, 'update'])->name('grade-levels.update');
        Route::delete('/grade-levels/{gradeLevel}', [GradeLevelController::class, 'destroy'])->name('grade-levels.destroy');

        Route::get('/skills', [SkillController::class, 'index'])->name('skills.index');
        Route::post('/skills', [SkillController::class, 'store'])->name('skills.store');
        Route::patch('/skills/{skill}', [SkillController::class, 'update'])->name('skills.update');
        Route::delete('/skills/{skill}', [SkillController::class, 'destroy'])->name('skills.destroy');

        Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
        Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
        Route::patch('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('/courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');

        Route::get('/units', [UnitController::class, 'index'])->name('units.index');
        Route::post('/units', [UnitController::class, 'store'])->name('units.store');
        Route::patch('/units/{unit}', [UnitController::class, 'update'])->name('units.update');
        Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');

        Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
        Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
        Route::post('/lessons', [LessonController::class, 'store'])->name('lessons.store');
        Route::patch('/lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');

        Route::post('/activities', [ActivityController::class, 'store'])->name('activities.store');
        Route::patch('/activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');
        Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

        Route::post('/questions', [QuestionController::class, 'store'])->name('questions.store');
        Route::patch('/questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
        Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');

        Route::post('/question-options', [QuestionOptionController::class, 'store'])->name('question-options.store');
        Route::patch('/question-options/{questionOption}', [QuestionOptionController::class, 'update'])->name('question-options.update');
        Route::delete('/question-options/{questionOption}', [QuestionOptionController::class, 'destroy'])->name('question-options.destroy');
    });
});

require __DIR__.'/auth.php';
