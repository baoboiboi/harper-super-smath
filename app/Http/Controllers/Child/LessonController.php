<?php

namespace App\Http\Controllers\Child;

use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class LessonController extends Controller
{
    public function show(Request $request, Lesson $lesson): Response
    {
        if (! Lesson::query()->publiclyAvailable()->whereKey($lesson->id)->exists()) {
            throw new NotFoundHttpException();
        }

        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        $activities = $lesson->activities()->withCount('questions')->orderBy('order')->get();

        $attempts = $childProfile->activityAttempts()
            ->whereIn('activity_id', $activities->pluck('id'))
            ->get()
            ->groupBy('activity_id');

        $typingExercises = $lesson->typingExercises()->orderBy('order')->get();

        $typingSessionsByExercise = $childProfile->typingSessions()
            ->whereIn('typing_exercise_id', $typingExercises->pluck('id'))
            ->get()
            ->groupBy('typing_exercise_id');

        $drawingPrompts = $lesson->drawingPrompts()->orderBy('order')->get();

        $artworkCountsByPrompt = $childProfile->artworks()
            ->whereIn('drawing_prompt_id', $drawingPrompts->pluck('id'))
            ->get()
            ->groupBy('drawing_prompt_id');

        return Inertia::render('Child/LessonShow', [
            'lesson' => $lesson->only(['id', 'title', 'description', 'learning_objective', 'instructions', 'difficulty', 'points_available', 'estimated_minutes']),
            'activities' => $activities->map(function ($activity) use ($attempts) {
                $activityAttempts = $attempts->get($activity->id, collect());
                $latest = $activityAttempts->sortByDesc('id')->first();

                return [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'type' => $activity->type->value,
                    'questions_count' => $activity->questions_count,
                    'points' => $activity->points,
                    'status' => match (true) {
                        $latest && $latest->isComplete() => 'completed',
                        $latest !== null => 'in_progress',
                        default => 'not_started',
                    },
                    'best_score' => $activityAttempts->where('completed_at', '!=', null)->max('correct_count'),
                ];
            }),
            'typingExercises' => $typingExercises->map(function ($exercise) use ($typingSessionsByExercise) {
                $sessions = $typingSessionsByExercise->get($exercise->id, collect());

                return [
                    'id' => $exercise->id,
                    'title' => $exercise->title,
                    'type' => $exercise->type->value,
                    'points' => $exercise->points,
                    'attempts_count' => $sessions->count(),
                    'best_wpm' => $sessions->max('wpm'),
                    'best_accuracy' => $sessions->max('accuracy_percent'),
                ];
            }),
            'drawingPrompts' => $drawingPrompts->map(fn ($prompt) => [
                'id' => $prompt->id,
                'title' => $prompt->title,
                'type' => $prompt->type->value,
                'points' => $prompt->points,
                'attempts_count' => $artworkCountsByPrompt->get($prompt->id, collect())->count(),
            ]),
        ]);
    }
}
