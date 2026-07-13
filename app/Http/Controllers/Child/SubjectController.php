<?php

namespace App\Http\Controllers\Child;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use App\Models\Lesson;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Child/Subjects', [
            'subjects' => Subject::query()
                ->where('is_active', true)
                ->withCount(['skills as published_lesson_count' => function ($query) {
                    $query->join('courses', 'courses.skill_id', '=', 'skills.id')
                        ->join('units', 'units.course_id', '=', 'courses.id')
                        ->join('lessons', 'lessons.unit_id', '=', 'units.id')
                        ->where('courses.status', ContentStatus::Published)
                        ->where('units.status', ContentStatus::Published)
                        ->where('lessons.status', ContentStatus::Published);
                }])
                ->orderBy('order')
                ->orderBy('name')
                ->get(['id', 'name', 'icon', 'description']),
        ]);
    }

    public function show(Request $request, Subject $subject): Response
    {
        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        $lessons = Lesson::query()
            ->publiclyAvailable()
            ->whereHas('unit.course.skill', fn ($q) => $q->where('subject_id', $subject->id))
            ->withCount('activities')
            ->with('activities:id,lesson_id')
            ->orderBy('order')
            ->orderBy('title')
            ->get(['id', 'unit_id', 'title', 'description', 'difficulty', 'points_available', 'estimated_minutes']);

        $completedActivityIds = $childProfile->activityAttempts()
            ->whereNotNull('completed_at')
            ->whereIn('activity_id', $lessons->pluck('activities')->flatten()->pluck('id'))
            ->pluck('activity_id');

        return Inertia::render('Child/SubjectLessons', [
            'subject' => $subject->only(['id', 'name', 'icon']),
            'lessons' => $lessons->map(fn (Lesson $lesson) => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'difficulty' => $lesson->difficulty,
                'points_available' => $lesson->points_available,
                'estimated_minutes' => $lesson->estimated_minutes,
                'activities_count' => $lesson->activities_count,
                'is_completed' => $lesson->activities_count > 0
                    && $lesson->activities->pluck('id')->every(fn ($id) => $completedActivityIds->contains($id)),
            ]),
        ]);
    }
}
