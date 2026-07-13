<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['child_profile_id', 'drawing_prompt_id', 'title', 'image_path'])]
class Artwork extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::deleting(function (Artwork $artwork) {
            Storage::disk('public')->delete($artwork->image_path);
        });
    }

    public function imageUrl(): string
    {
        return Storage::disk('public')->url($this->image_path);
    }

    /**
     * @return BelongsTo<ChildProfile, $this>
     */
    public function childProfile(): BelongsTo
    {
        return $this->belongsTo(ChildProfile::class);
    }

    /**
     * @return BelongsTo<DrawingPrompt, $this>
     */
    public function drawingPrompt(): BelongsTo
    {
        return $this->belongsTo(DrawingPrompt::class);
    }
}
