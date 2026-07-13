<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'unit_id', 'required_skill_id', 'title', 'slug', 'description',
    'learning_objective', 'instructions', 'difficulty', 'estimated_minutes',
    'points_available', 'order', 'status', 'published_at',
])]
class Lesson extends Model
{
    use HasFactory, HasSlug;

    protected $attributes = [
        'status' => 'draft',
        'difficulty' => 1,
        'points_available' => 0,
        'order' => 0,
    ];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    protected function slugSourceAttribute(): string
    {
        return 'title';
    }

    protected function slugScopeColumns(): array
    {
        return ['unit_id'];
    }

    /**
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * @return BelongsTo<Skill, $this>
     */
    public function requiredSkill(): BelongsTo
    {
        return $this->belongsTo(Skill::class, 'required_skill_id');
    }

    /**
     * @return HasMany<Activity, $this>
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Lessons visible to children: the lesson itself and its unit and
     * course must all be published.
     *
     * @param  Builder<Lesson>  $query
     * @return Builder<Lesson>
     */
    public function scopePubliclyAvailable(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Published)
            ->whereHas('unit', function ($query) {
                $query->where('status', ContentStatus::Published)
                    ->whereHas('course', fn ($q) => $q->where('status', ContentStatus::Published));
            });
    }
}
