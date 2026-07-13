<?php

namespace App\Http\Requests\Child;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveArtworkRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:100'],
            'image' => ['required', 'string', 'regex:/^data:image\/png;base64,/', 'max:7000000'],
            'drawing_prompt_id' => ['nullable', 'exists:drawing_prompts,id'],
        ];
    }
}
