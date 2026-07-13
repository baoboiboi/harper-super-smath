<?php

namespace App\Http\Controllers\Child;

use App\Http\Controllers\Controller;
use App\Http\Requests\Child\SubmitAnswerRequest;
use App\Models\Activity;
use App\Models\ActivityAttempt;
use App\Models\ChildProfile;
use App\Models\Lesson;
use App\Services\QuestionGrader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ActivityPlayController extends Controller
{
    public function show(Request $request, Activity $activity): Response
    {
        $this->ensureAvailable($activity);

        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        if (session()->has('feedback')) {
            return Inertia::render('Child/ActivityPlay', [
                'activity' => $activity->only(['id', 'lesson_id', 'title']),
                'feedback' => session('feedback'),
            ]);
        }

        $attempt = $this->resolveAttemptForShow($childProfile, $activity, $request->boolean('retry'));

        $question = $attempt->currentQuestion();

        if ($question === null) {
            return Inertia::render('Child/ActivityPlay', [
                'activity' => $activity->only(['id', 'lesson_id', 'title']),
                'summary' => [
                    'total_questions' => $attempt->total_questions,
                    'correct_count' => $attempt->correct_count,
                    'points_earned' => $attempt->points_earned,
                    'accuracy' => $attempt->accuracyPercent(),
                ],
            ]);
        }

        return Inertia::render('Child/ActivityPlay', [
            'activity' => $activity->only(['id', 'lesson_id', 'title']),
            'question' => [
                'id' => $question->id,
                'type' => $question->type->value,
                'prompt' => $question->prompt,
                'hint' => $question->hint,
                'options' => QuestionGrader::isChoiceBased($question->type)
                    ? $question->options()->orderBy('order')->get(['id', 'label'])->shuffle()->values()
                    : [],
            ],
            'progress' => [
                'answered' => $attempt->questionAttempts()->count(),
                'total' => $attempt->total_questions,
            ],
        ]);
    }

    public function answer(SubmitAnswerRequest $request, Activity $activity): RedirectResponse
    {
        $this->ensureAvailable($activity);

        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        $attempt = $this->activeIncompleteAttempt($childProfile, $activity)
            ?? $this->startNewAttempt($childProfile, $activity);
        $question = $attempt->currentQuestion();

        if ($question === null) {
            return redirect()->route('child.activities.play', $activity);
        }

        $grader = new QuestionGrader();
        $isCorrect = $grader->grade($question, $request->validated('option_id'), $request->validated('answer_text'));
        $pointsEarned = $isCorrect ? $question->points : 0;

        DB::transaction(function () use ($attempt, $question, $request, $isCorrect, $pointsEarned) {
            $attempt->questionAttempts()->create([
                'question_id' => $question->id,
                'given_answer' => array_filter([
                    'option_id' => $request->validated('option_id'),
                    'text' => $request->validated('answer_text'),
                ], fn ($value) => $value !== null),
                'is_correct' => $isCorrect,
                'hint_used' => (bool) $request->validated('used_hint'),
                'points_earned' => $pointsEarned,
            ]);

            $attempt->increment('correct_count', $isCorrect ? 1 : 0);
            $attempt->increment('points_earned', $pointsEarned);

            if ($attempt->questionAttempts()->count() >= $attempt->total_questions) {
                $attempt->update(['completed_at' => now()]);
            }
        });

        $correctOption = $question->options()->where('is_correct', true)->first();

        session()->flash('feedback', [
            'is_correct' => $isCorrect,
            'explanation' => $question->explanation,
            'correct_label' => $correctOption?->label ?? ($question->correct_answer['value'] ?? null),
        ]);

        return redirect()->route('child.activities.play', $activity);
    }

    private function ensureAvailable(Activity $activity): void
    {
        $available = Lesson::query()
            ->publiclyAvailable()
            ->whereKey($activity->lesson_id)
            ->exists();

        if (! $available || ! QuestionGrader::isPlayable($activity->type)) {
            throw new NotFoundHttpException();
        }
    }

    /**
     * Resolve which attempt a GET to the play page should show: resume an
     * in-progress attempt, show the summary of the most recently completed
     * one, or start fresh (first visit, or an explicit "Play Again" retry).
     */
    private function resolveAttemptForShow(ChildProfile $childProfile, Activity $activity, bool $retry): ActivityAttempt
    {
        if ($attempt = $this->activeIncompleteAttempt($childProfile, $activity)) {
            return $attempt;
        }

        if (! $retry) {
            $completed = ActivityAttempt::query()
                ->where('child_profile_id', $childProfile->id)
                ->where('activity_id', $activity->id)
                ->whereNotNull('completed_at')
                ->latest('id')
                ->first();

            if ($completed) {
                return $completed;
            }
        }

        return $this->startNewAttempt($childProfile, $activity);
    }

    private function activeIncompleteAttempt(ChildProfile $childProfile, Activity $activity): ?ActivityAttempt
    {
        return ActivityAttempt::query()
            ->where('child_profile_id', $childProfile->id)
            ->where('activity_id', $activity->id)
            ->whereNull('completed_at')
            ->latest('id')
            ->first();
    }

    private function startNewAttempt(ChildProfile $childProfile, Activity $activity): ActivityAttempt
    {
        return ActivityAttempt::create([
            'child_profile_id' => $childProfile->id,
            'activity_id' => $activity->id,
            'started_at' => now(),
            'total_questions' => $activity->questions()->count(),
        ]);
    }
}
