<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['child_profile_id', 'activity_id', 'started_at', 'completed_at', 'total_questions', 'correct_count', 'points_earned'])]
class ActivityAttempt extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<ChildProfile, $this>
     */
    public function childProfile(): BelongsTo
    {
        return $this->belongsTo(ChildProfile::class);
    }

    /**
     * @return BelongsTo<Activity, $this>
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * @return HasMany<QuestionAttempt, $this>
     */
    public function questionAttempts(): HasMany
    {
        return $this->hasMany(QuestionAttempt::class);
    }

    public function isComplete(): bool
    {
        return $this->completed_at !== null;
    }

    public function currentQuestion(): ?Question
    {
        $answeredQuestionIds = $this->questionAttempts()->pluck('question_id');

        return $this->activity->questions()
            ->orderBy('order')
            ->whereNotIn('id', $answeredQuestionIds)
            ->first();
    }

    public function accuracyPercent(): int
    {
        if ($this->total_questions === 0) {
            return 0;
        }

        return (int) round(($this->correct_count / $this->total_questions) * 100);
    }
}
