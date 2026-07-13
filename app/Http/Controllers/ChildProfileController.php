<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChildProfileRequest;
use App\Models\AuditLog;
use App\Models\ChildProfile;
use Illuminate\Http\RedirectResponse;

class ChildProfileController extends Controller
{
    public function store(StoreChildProfileRequest $request): RedirectResponse
    {
        $childProfile = new ChildProfile($request->safe()->only(['name', 'avatar', 'age_band', 'grade_level']));
        $childProfile->parent_id = $request->user()->id;
        $childProfile->setPin($request->validated('pin'));
        $childProfile->save();

        AuditLog::record('child_profile.created', $childProfile, [], $request->user());

        return redirect()->route('parent.dashboard')->with('status', "{$childProfile->name}'s profile was created.");
    }

    public function destroy(ChildProfile $childProfile): RedirectResponse
    {
        $this->authorize('delete', $childProfile);

        $childProfile->delete();

        AuditLog::record('child_profile.deleted', $childProfile, [], request()->user());

        return redirect()->route('parent.dashboard')->with('status', "{$childProfile->name}'s profile was removed.");
    }
}
