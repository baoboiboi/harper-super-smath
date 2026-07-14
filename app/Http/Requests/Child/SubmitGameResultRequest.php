<?php

namespace App\Http\Requests\Child;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitGameResultRequest extends FormRequest
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
            'difficulty' => ['required', Rule::in(['easy', 'medium', 'hard'])],
            'score' => ['required', 'integer', 'min:0', 'max:1000'],
            'rounds_played' => ['required', 'integer', 'min:1', 'max:100'],
            'time_spent_seconds' => ['required', 'integer', 'min:1', 'max:3600'],
        ];
    }
}
