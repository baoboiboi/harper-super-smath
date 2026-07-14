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

            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                    href={route('child.games.index')}
                    className="rounded-full bg-indigo-100 px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-200"
                >
                    🎮 Games
                </Link>
                <Link
                    href={route('child.draw')}
                    className="rounded-full bg-pink-100 px-6 py-3 font-semibold text-pink-700 hover:bg-pink-200"
                >
                    🎨 Draw
                </Link>
                <Link
                    href={route('child.gallery')}
                    className="rounded-full bg-white px-6 py-3 font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
                >
                    🖼️ My Gallery
                </Link>
            </div>
        </ChildLayout>
    );
}
