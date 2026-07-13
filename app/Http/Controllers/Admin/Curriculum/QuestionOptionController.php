<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\QuestionOptionRequest;
use App\Models\QuestionOption;
use Illuminate\Http\RedirectResponse;

class QuestionOptionController extends Controller
{
    public function store(QuestionOptionRequest $request): RedirectResponse
    {
        QuestionOption::create($request->validated());

        return back()->with('status', 'Answer option added.');
    }

    public function update(QuestionOptionRequest $request, QuestionOption $questionOption): RedirectResponse
    {
        $questionOption->update($request->validated());

        return back()->with('status', 'Answer option updated.');
    }

    public function destroy(QuestionOption $questionOption): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $questionOption->delete();

        return back()->with('status', 'Answer option deleted.');
    }
}
