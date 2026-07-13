<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasSlug
{
    protected static function bootHasSlug(): void
    {
        static::creating(function ($model) {
            if (blank($model->slug)) {
                $model->slug = $model->generateUniqueSlug();
            }
        });
    }

    protected function slugSourceAttribute(): string
    {
        return 'name';
    }

    /**
     * Columns that scope slug uniqueness (e.g. a parent foreign key),
     * beyond the default of being unique across the whole table.
     *
     * @return list<string>
     */
    protected function slugScopeColumns(): array
    {
        return [];
    }

    protected function generateUniqueSlug(): string
    {
        $base = Str::slug($this->{$this->slugSourceAttribute()});
        $slug = $base;
        $suffix = 1;

        while (
            static::query()
                ->where('slug', $slug)
                ->when($this->slugScopeColumns(), function ($query) {
                    foreach ($this->slugScopeColumns() as $column) {
                        $query->where($column, $this->{$column});
                    }
                })
                ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
