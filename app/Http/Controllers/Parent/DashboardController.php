<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Parent/Dashboard', [
            'childProfiles' => $request->user()
                ->childProfiles()
                ->orderBy('name')
                ->get(['id', 'name', 'avatar', 'age_band', 'grade_level', 'suspended_at']),
            'status' => session('status'),
        ]);
    }
}
