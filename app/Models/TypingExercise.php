<?php

namespace App\Models;

use App\Enums\TypingExerciseType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['lesson_id', 'type', 'title', 'target_text', 'target_keys', 'time_limit_seconds', 'points', 'order'])]
class TypingExercise extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => TypingExerciseType::class,
        ];
    }

    /**
     * @return BelongsTo<Lesson, $this>
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * @return HasMany<TypingSession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(TypingSession::class);
    }
}
