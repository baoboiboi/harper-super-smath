<?php

namespace App\Models;

use App\Enums\DrawingPromptType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['lesson_id', 'type', 'title', 'instructions', 'template_text', 'points', 'order'])]
class DrawingPrompt extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => DrawingPromptType::class,
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
     * @return HasMany<Artwork, $this>
     */
    public function artworks(): HasMany
    {
        return $this->hasMany(Artwork::class);
    }
}
