<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['activity_attempt_id', 'question_id', 'given_answer', 'is_correct', 'hint_used', 'points_earned'])]
class QuestionAttempt extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'given_answer' => 'array',
            'is_correct' => 'boolean',
            'hint_used' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<ActivityAttempt, $this>
     */
    public function activityAttempt(): BelongsTo
    {
        return $this->belongsTo(ActivityAttempt::class);
    }

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
