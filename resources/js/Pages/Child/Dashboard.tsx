import EmptyState from '@/Components/EmptyState';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({
    childProfile,
    hasSubjects,
}: {
    childProfile: {
        id: number;
        name: string;
        avatar: string | null;
        age_band: string | null;
        grade_level: string | null;
    };
    hasSubjects: boolean;
}) {
    return (
        <ChildLayout>
            <Head title={`${childProfile.name}'s Dashboard`} />

            <div className="pt-10 text-8xl">
                {childProfile.avatar ?? '🧒'}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
                Welcome back, {childProfile.name}!
            </h1>

            <div className="mt-4 flex justify-center gap-6 text-lg font-semibold text-gray-600">
                <span>⭐ 0 points</span>
                <span>🔥 0 day streak</span>
            </div>

            <div className="mt-10">
                {hasSubjects ? (
                    <Link
                        href={route('child.subjects.index')}
                        className="inline-block rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700"
                    >
                        🚀 Start Learning
                    </Link>
                ) : (
                    <EmptyState
                        icon="📚"
                        title="No lessons yet"
                        description="Your grown-up is still setting things up. Check back soon for new activities!"
                    />
                )}
            </div>
        </ChildLayout>
    );
}
