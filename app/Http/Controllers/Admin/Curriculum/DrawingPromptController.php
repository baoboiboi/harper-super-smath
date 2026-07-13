<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\DrawingPromptRequest;
use App\Models\DrawingPrompt;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DrawingPromptController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Curriculum/DrawingPrompts', [
            'drawingPrompts' => DrawingPrompt::query()
                ->with('lesson:id,title')
                ->orderBy('order')
                ->orderBy('title')
                ->get(),
            'lessons' => Lesson::query()->orderBy('title')->get(['id', 'title']),
            'status' => session('status'),
        ]);
    }

    public function store(DrawingPromptRequest $request): RedirectResponse
    {
        DrawingPrompt::create($request->validated());

        return back()->with('status', 'Drawing prompt created.');
    }

    public function update(DrawingPromptRequest $request, DrawingPrompt $drawingPrompt): RedirectResponse
    {
        $drawingPrompt->update($request->validated());

        return back()->with('status', 'Drawing prompt updated.');
    }

    public function destroy(DrawingPrompt $drawingPrompt): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $drawingPrompt->delete();

        return back()->with('status', 'Drawing prompt deleted.');
    }
}
