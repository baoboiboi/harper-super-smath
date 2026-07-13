<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\QuestionRequest;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;

class QuestionController extends Controller
{
    public function store(QuestionRequest $request): RedirectResponse
    {
        Question::create($request->validated());

        return back()->with('status', 'Question added.');
    }

    public function update(QuestionRequest $request, Question $question): RedirectResponse
    {
        $question->update($request->validated());

        return back()->with('status', 'Question updated.');
    }

    public function destroy(Question $question): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $question->delete();

        return back()->with('status', 'Question deleted.');
    }
}
