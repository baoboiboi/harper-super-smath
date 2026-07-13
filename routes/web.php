<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Child\DashboardController as ChildDashboardController;
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
});

require __DIR__.'/auth.php';
