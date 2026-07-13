import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    suspended: boolean;
    roles: string[];
};

export default function Users({
    users,
    assignableRoles,
    status,
}: {
    users: AdminUser[];
    assignableRoles: string[];
    status?: string;
}) {
    const changeRole = (user: AdminUser, role: string) => {
        router.patch(route('admin.users.update-role', user.id), { role });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Users
                </h2>
            }
        >
            <Head title="Admin — Users" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                {status && (
                    <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {status}
                    </div>
                )}

                <Card className="overflow-x-auto p-0">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {user.suspended ? (
                                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                                Suspended
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <select
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                            value={user.roles[0] ?? ''}
                                            onChange={(e) =>
                                                changeRole(
                                                    user,
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="" disabled>
                                                No role
                                            </option>
                                            {assignableRoles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
