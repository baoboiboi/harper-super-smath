<?php

namespace App\Http\Controllers\Child;

use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use App\Models\Lesson;
use App\Models\Subject;
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
            'hasSubjects' => Subject::query()->where('is_active', true)->exists()
                && Lesson::query()->publiclyAvailable()->exists(),
        ]);
    }
}
