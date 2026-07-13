<?php

namespace App\Http\Middleware;

use App\Models\ChildProfile;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveChildProfile
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $childProfileId = $request->session()->get('active_child_profile_id');

        $childProfile = $childProfileId
            ? ChildProfile::query()
                ->where('id', $childProfileId)
                ->where('parent_id', $request->user()?->id)
                ->whereNull('suspended_at')
                ->first()
            : null;

        if (! $childProfile) {
            $request->session()->forget('active_child_profile_id');

            return redirect()->route('parent.dashboard')
                ->with('status', 'Please select a child profile to continue.');
        }

        $request->attributes->set('activeChildProfile', $childProfile);

        return $next($request);
    }
}
