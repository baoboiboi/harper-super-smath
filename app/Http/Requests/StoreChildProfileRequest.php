<?php

namespace App\Http\Requests;

use App\Models\ChildProfile;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreChildProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', ChildProfile::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'pin' => ['required', 'digits:4', 'confirmed'],
            'avatar' => ['nullable', 'string', 'max:50'],
            'age_band' => ['nullable', 'string', 'in:3-5,6-8,9-11,12+'],
            'grade_level' => ['nullable', 'string', 'max:50'],
        ];
    }
}
