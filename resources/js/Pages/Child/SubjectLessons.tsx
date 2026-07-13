import EmptyState from '@/Components/EmptyState';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link } from '@inertiajs/react';

type Lesson = {
    id: number;
    title: string;
    description: string | null;
    difficulty: number;
    points_available: number;
    estimated_minutes: number | null;
    activities_count: number;
    is_completed: boolean;
};

export default function SubjectLessons({
    subject,
    lessons,
}: {
    subject: { id: number; name: string; icon: string | null };
    lessons: Lesson[];
}) {
    return (
        <ChildLayout>
            <Head title={subject.name} />

            <div className="pt-6 text-6xl">{subject.icon ?? '📘'}</div>
            <h1 className="mt-2 text-2xl font-extrabold text-gray-800">{subject.name}</h1>

            {lessons.length === 0 ? (
                <div className="mt-10">
                    <EmptyState icon="📚" title="No lessons yet" description="Check back soon!" />
                </div>
            ) : (
                <div className="mt-8 space-y-3">
                    {lessons.map((lesson) => (
                        <Link
                            key={lesson.id}
                            href={route('child.lessons.show', lesson.id)}
                            className="flex items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm hover:shadow-md"
                        >
                            <div>
                                <p className="font-bold text-gray-800">
                                    {lesson.is_completed && '✅ '}
                                    {lesson.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {'⭐'.repeat(lesson.difficulty)} · {lesson.points_available} pts
                                    {lesson.estimated_minutes && <> · {lesson.estimated_minutes} min</>}
                                </p>
                            </div>
                            <span className="text-2xl text-gray-300">&rarr;</span>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <Link href={route('child.subjects.index')} className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Back to subjects
                </Link>
            </div>
        </ChildLayout>
    );
}
