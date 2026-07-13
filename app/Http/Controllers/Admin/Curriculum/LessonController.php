<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\LessonRequest;
use App\Models\Lesson;
use App\Models\Skill;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Curriculum/Lessons', [
            'lessons' => Lesson::query()
                ->with('unit:id,title')
                ->withCount('activities')
                ->orderBy('order')
                ->orderBy('title')
                ->get(),
            'units' => Unit::query()->orderBy('title')->get(['id', 'title']),
            'skills' => Skill::query()->orderBy('name')->get(['id', 'name']),
            'status' => session('status'),
        ]);
    }

    public function show(Lesson $lesson): Response
    {
        return Inertia::render('Admin/Curriculum/LessonEditor', [
            'lesson' => $lesson->load([
                'unit:id,title',
                'requiredSkill:id,name',
                'activities' => fn ($query) => $query->orderBy('order'),
                'activities.questions' => fn ($query) => $query->orderBy('order'),
                'activities.questions.options' => fn ($query) => $query->orderBy('order'),
            ]),
            'skills' => Skill::query()->orderBy('name')->get(['id', 'name']),
            'status' => session('status'),
        ]);
    }

    public function store(LessonRequest $request): RedirectResponse
    {
        Lesson::create($request->validated());

        return back()->with('status', 'Lesson created.');
    }

    public function update(LessonRequest $request, Lesson $lesson): RedirectResponse
    {
        $lesson->update($request->validated());

        return back()->with('status', 'Lesson updated.');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $lesson->delete();

        return back()->with('status', 'Lesson deleted.');
    }
}
