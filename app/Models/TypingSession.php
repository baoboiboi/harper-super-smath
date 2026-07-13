<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['child_profile_id', 'typing_exercise_id', 'typed_text', 'wpm', 'accuracy_percent', 'error_count', 'key_stats', 'points_earned'])]
class TypingSession extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'key_stats' => 'array',
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
     * @return BelongsTo<TypingExercise, $this>
     */
    public function typingExercise(): BelongsTo
    {
        return $this->belongsTo(TypingExercise::class);
    }
}
