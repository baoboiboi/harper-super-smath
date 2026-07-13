<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Users', [
            'users' => User::query()
                ->with('roles:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'suspended_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'suspended' => $user->isSuspended(),
                    'roles' => $user->roles->pluck('name'),
                ]),
            'assignableRoles' => Role::query()->orderBy('name')->pluck('name'),
            'status' => session('status'),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'role' => ['required', Rule::in(Role::query()->pluck('name'))],
        ]);

        if ($data['role'] === 'super_admin' && ! $request->user()->hasRole('super_admin')) {
            abort(403, 'Only a super administrator can grant the super administrator role.');
        }

        $user->syncRoles([$data['role']]);

        AuditLog::record('user.role_assigned', $user, ['role' => $data['role']], $request->user());

        return back()->with('status', "{$user->name}'s role was updated.");
    }
}
