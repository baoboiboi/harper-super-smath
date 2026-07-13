import EmptyState from '@/Components/EmptyState';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link } from '@inertiajs/react';

type Subject = {
    id: number;
    name: string;
    icon: string | null;
    description: string | null;
    published_lesson_count: number;
};

export default function Subjects({ subjects }: { subjects: Subject[] }) {
    const available = subjects.filter((s) => s.published_lesson_count > 0);

    return (
        <ChildLayout>
            <Head title="Choose a Subject" />

            <h1 className="pt-6 text-2xl font-extrabold text-gray-800">
                What do you want to learn today?
            </h1>

            {available.length === 0 ? (
                <div className="mt-10">
                    <EmptyState icon="📚" title="No lessons yet" description="Check back soon!" />
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-2 gap-4">
                    {available.map((subject) => (
                        <Link
                            key={subject.id}
                            href={route('child.subjects.show', subject.id)}
                            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
                        >
                            <span className="text-5xl">{subject.icon ?? '📘'}</span>
                            <span className="text-lg font-bold text-gray-800">{subject.name}</span>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <Link href={route('child.dashboard')} className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Back to dashboard
                </Link>
            </div>
        </ChildLayout>
    );
}
