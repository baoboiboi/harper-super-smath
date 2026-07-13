<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\CourseRequest;
use App\Models\Course;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Curriculum/Courses', [
            'courses' => Course::query()
                ->with('skill:id,name')
                ->withCount('units')
                ->orderBy('order')
                ->orderBy('title')
                ->get(),
            'skills' => Skill::query()->orderBy('name')->get(['id', 'name']),
            'status' => session('status'),
        ]);
    }

    public function store(CourseRequest $request): RedirectResponse
    {
        Course::create($request->validated());

        return back()->with('status', 'Course created.');
    }

    public function update(CourseRequest $request, Course $course): RedirectResponse
    {
        $course->update($request->validated());

        return back()->with('status', 'Course updated.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $course->delete();

        return back()->with('status', 'Course deleted.');
    }
}
