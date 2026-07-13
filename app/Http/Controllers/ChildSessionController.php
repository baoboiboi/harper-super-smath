<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChildPinLoginRequest;
use App\Models\ChildProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ChildSessionController extends Controller
{
    public function create(ChildProfile $childProfile): Response
    {
        $this->authorize('view', $childProfile);

        return Inertia::render('Parent/EnterChildPin', [
            'childProfile' => $childProfile->only(['id', 'name', 'avatar']),
        ]);
    }

    public function store(ChildPinLoginRequest $request, ChildProfile $childProfile): RedirectResponse
    {
        if (! $childProfile->checkPin($request->validated('pin'))) {
            throw ValidationException::withMessages([
                'pin' => 'That PIN is not correct.',
            ]);
        }

        $request->session()->put('active_child_profile_id', $childProfile->id);

        return redirect()->route('child.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->session()->forget('active_child_profile_id');

        return redirect()->route('parent.dashboard');
    }
}
