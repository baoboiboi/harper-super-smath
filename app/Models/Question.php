<?php

namespace App\Models;

use App\Enums\QuestionFormat;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['activity_id', 'type', 'prompt', 'correct_answer', 'hint', 'explanation', 'points', 'order'])]
class Question extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => QuestionFormat::class,
            'correct_answer' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Activity, $this>
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * @return HasMany<QuestionOption, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class);
    }
}
