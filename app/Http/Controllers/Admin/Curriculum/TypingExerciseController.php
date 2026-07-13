<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\TypingExerciseRequest;
use App\Models\Lesson;
use App\Models\TypingExercise;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TypingExerciseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Curriculum/TypingExercises', [
            'typingExercises' => TypingExercise::query()
                ->with('lesson:id,title')
                ->orderBy('order')
                ->orderBy('title')
                ->get(),
            'lessons' => Lesson::query()->orderBy('title')->get(['id', 'title']),
            'status' => session('status'),
        ]);
    }

    public function store(TypingExerciseRequest $request): RedirectResponse
    {
        TypingExercise::create($request->validated());

        return back()->with('status', 'Typing exercise created.');
    }

    public function update(TypingExerciseRequest $request, TypingExercise $typingExercise): RedirectResponse
    {
        $typingExercise->update($request->validated());

        return back()->with('status', 'Typing exercise updated.');
    }

    public function destroy(TypingExercise $typingExercise): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $typingExercise->delete();

        return back()->with('status', 'Typing exercise deleted.');
    }
}
