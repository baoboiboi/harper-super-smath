<?php

namespace App\Http\Controllers\Admin\Curriculum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Curriculum\ActivityRequest;
use App\Models\Activity;
use Illuminate\Http\RedirectResponse;

class ActivityController extends Controller
{
    public function store(ActivityRequest $request): RedirectResponse
    {
        Activity::create($request->validated());

        return back()->with('status', 'Activity added.');
    }

    public function update(ActivityRequest $request, Activity $activity): RedirectResponse
    {
        $activity->update($request->validated());

        return back()->with('status', 'Activity updated.');
    }

    public function destroy(Activity $activity): RedirectResponse
    {
        $this->authorize('admin.manage-curriculum');

        $activity->delete();

        return back()->with('status', 'Activity deleted.');
    }
}
