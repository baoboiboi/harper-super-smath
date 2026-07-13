<?php

namespace App\Http\Controllers\Child;

use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        return Inertia::render('Child/Dashboard', [
            'childProfile' => $childProfile->only(['id', 'name', 'avatar', 'age_band', 'grade_level']),
        ]);
    }
}
