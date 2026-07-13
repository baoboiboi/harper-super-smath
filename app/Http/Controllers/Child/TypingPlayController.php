<?php

namespace App\Http\Controllers\Child;

use App\Http\Controllers\Controller;
use App\Http\Requests\Child\SubmitTypingResultRequest;
use App\Models\ChildProfile;
use App\Models\Lesson;
use App\Models\TypingExercise;
use App\Services\TypingGrader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TypingPlayController extends Controller
{
    public function show(Request $request, TypingExercise $typingExercise): Response
    {
        $this->ensureAvailable($typingExercise);

        if (session()->has('typing_summary')) {
            return Inertia::render('Child/TypingPlay', [
                'exercise' => $typingExercise->only(['id', 'lesson_id', 'title']),
                'summary' => session('typing_summary'),
            ]);
        }

        return Inertia::render('Child/TypingPlay', [
            'exercise' => [
                'id' => $typingExercise->id,
                'lesson_id' => $typingExercise->lesson_id,
                'title' => $typingExercise->title,
                'type' => $typingExercise->type->value,
                'target_text' => $typingExercise->target_text,
                'target_keys' => $typingExercise->target_keys,
                'time_limit_seconds' => $typingExercise->time_limit_seconds,
            ],
        ]);
    }

    public function complete(SubmitTypingResultRequest $request, TypingExercise $typingExercise): RedirectResponse
    {
        $this->ensureAvailable($typingExercise);

        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        $result = (new TypingGrader())->grade(
            $typingExercise->target_text,
            $request->validated('typed_text'),
            $request->validated('elapsed_seconds'),
        );

        $pointsEarned = (int) round($typingExercise->points * ($result['accuracy_percent'] / 100));

        $childProfile->typingSessions()->create([
            'typing_exercise_id' => $typingExercise->id,
            'typed_text' => $request->validated('typed_text'),
            'wpm' => $result['wpm'],
            'accuracy_percent' => $result['accuracy_percent'],
            'error_count' => $result['error_count'],
            'key_stats' => $result['key_stats'],
            'points_earned' => $pointsEarned,
        ]);

        session()->flash('typing_summary', [
            'wpm' => $result['wpm'],
            'accuracy_percent' => $result['accuracy_percent'],
            'error_count' => $result['error_count'],
            'points_earned' => $pointsEarned,
        ]);

        return redirect()->route('child.typing-exercises.play', $typingExercise);
    }

    private function ensureAvailable(TypingExercise $typingExercise): void
    {
        $available = Lesson::query()
            ->publiclyAvailable()
            ->whereKey($typingExercise->lesson_id)
            ->exists();

        if (! $available) {
            throw new NotFoundHttpException();
        }
    }
}
