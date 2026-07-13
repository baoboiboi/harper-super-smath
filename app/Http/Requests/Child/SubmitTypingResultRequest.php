<?php

namespace App\Http\Requests\Child;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitTypingResultRequest extends FormRequest
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
            'typed_text' => ['required', 'string', 'max:2000'],
            'elapsed_seconds' => ['required', 'integer', 'min:1', 'max:3600'],
        ];
    }
}
