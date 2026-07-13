<?php

namespace App\Http\Requests\Curriculum;

use App\Enums\TypingExerciseType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TypingExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('admin.manage-curriculum') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'lesson_id' => ['required', 'exists:lessons,id'],
            'type' => ['required', Rule::enum(TypingExerciseType::class)],
            'title' => ['required', 'string', 'max:150'],
            'target_text' => ['required', 'string', 'max:2000'],
            'target_keys' => ['nullable', 'string', 'max:50'],
            'time_limit_seconds' => ['nullable', 'integer', 'min:5', 'max:600'],
            'points' => ['nullable', 'integer', 'min:0'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
