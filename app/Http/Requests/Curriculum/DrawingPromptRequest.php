<?php

namespace App\Http\Requests\Curriculum;

use App\Enums\DrawingPromptType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DrawingPromptRequest extends FormRequest
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
            'type' => ['required', Rule::enum(DrawingPromptType::class)],
            'title' => ['required', 'string', 'max:150'],
            'instructions' => ['nullable', 'string', 'max:1000'],
            'template_text' => ['nullable', 'string', 'max:10'],
            'points' => ['nullable', 'integer', 'min:0'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
