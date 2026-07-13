<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'totalUsers' => User::query()->count(),
                'totalChildProfiles' => ChildProfile::query()->count(),
                'suspendedUsers' => User::query()->whereNotNull('suspended_at')->count(),
            ],
        ]);
    }
}
