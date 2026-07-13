<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\GradeLevelRequest;
use App\Models\GradeLevel;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GradeLevelController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Curriculum/GradeLevels', [
            'gradeLevels' => GradeLevel::query()->withCount('skills')->orderBy('order')->orderBy('name')->get(),
            'status' => session('status'),
        ]);
    }

    public function store(GradeLevelRequest $request): RedirectResponse
    {
        GradeLevel::create($request->validated());

        return back()->with('status', 'Grade level created.');
    }

    public function update(GradeLevelRequest $request, GradeLevel $gradeLevel): RedirectResponse
    {
        $gradeLevel->update($request->validated());

        return back()->with('status', 'Grade level updated.');
    }

    public function destroy(GradeLevel $gradeLevel): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $gradeLevel->delete();

        return back()->with('status', 'Grade level deleted.');
    }
}
