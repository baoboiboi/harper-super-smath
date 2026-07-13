<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\UnitRequest;
use App\Models\Course;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Curriculum/Units', [
            'units' => Unit::query()
                ->with('course:id,title')
                ->withCount('lessons')
                ->orderBy('order')
                ->orderBy('title')
                ->get(),
            'courses' => Course::query()->orderBy('title')->get(['id', 'title']),
            'status' => session('status'),
        ]);
    }

    public function store(UnitRequest $request): RedirectResponse
    {
        Unit::create($request->validated());

        return back()->with('status', 'Unit created.');
    }

    public function update(UnitRequest $request, Unit $unit): RedirectResponse
    {
        $unit->update($request->validated());

        return back()->with('status', 'Unit updated.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $unit->delete();

        return back()->with('status', 'Unit deleted.');
    }
}
