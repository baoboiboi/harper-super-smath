<?php

namespace App\Http\Requests\Child;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'option_id' => ['nullable', 'integer', 'exists:question_options,id'],
            'answer_text' => ['nullable', 'string', 'max:255'],
            'used_hint' => ['nullable', 'boolean'],
        ];
    }
}
