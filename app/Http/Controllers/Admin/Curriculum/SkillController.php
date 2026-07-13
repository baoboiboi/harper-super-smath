<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\SkillRequest;
use App\Models\GradeLevel;
use App\Models\Skill;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Curriculum/Skills', [
            'skills' => Skill::query()
                ->with(['subject:id,name', 'gradeLevel:id,name'])
                ->withCount('courses')
                ->orderBy('order')
                ->orderBy('name')
                ->get(),
            'subjects' => Subject::query()->orderBy('name')->get(['id', 'name']),
            'gradeLevels' => GradeLevel::query()->orderBy('order')->get(['id', 'name']),
            'status' => session('status'),
        ]);
    }

    public function store(SkillRequest $request): RedirectResponse
    {
        Skill::create($request->validated());

        return back()->with('status', 'Skill created.');
    }

    public function update(SkillRequest $request, Skill $skill): RedirectResponse
    {
        $skill->update($request->validated());

        return back()->with('status', 'Skill updated.');
    }

    public function destroy(Skill $skill): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $skill->delete();

        return back()->with('status', 'Skill deleted.');
    }
}
