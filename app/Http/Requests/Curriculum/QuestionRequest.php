<?php

namespace App\Http\Requests\Curriculum;

use App\Enums\QuestionFormat;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionRequest extends FormRequest
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
            'activity_id' => ['required', 'exists:activities,id'],
            'type' => ['required', Rule::enum(QuestionFormat::class)],
            'prompt' => ['required', 'string', 'max:2000'],
            'correct_answer' => ['nullable', 'array'],
            'hint' => ['nullable', 'string', 'max:1000'],
            'explanation' => ['nullable', 'string', 'max:2000'],
            'points' => ['nullable', 'integer', 'min:0'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
