import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({
    metrics,
}: {
    metrics: {
        totalUsers: number;
        totalChildProfiles: number;
        suspendedUsers: number;
    };
}) {
    const tiles = [
        { label: 'Total Users', value: metrics.totalUsers },
        { label: 'Child Profiles', value: metrics.totalChildProfiles },
        { label: 'Suspended Users', value: metrics.suspendedUsers },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-4 sm:grid-cols-3">
                    {tiles.map((tile) => (
                        <Card key={tile.label} className="text-center">
                            <p className="text-3xl font-extrabold text-sky-600">
                                {tile.value}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {tile.label}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
