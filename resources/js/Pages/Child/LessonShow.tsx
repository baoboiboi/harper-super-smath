import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link } from '@inertiajs/react';

type Activity = {
    id: number;
    title: string;
    type: string;
    questions_count: number;
    points: number;
    status: 'not_started' | 'in_progress' | 'completed';
    best_score: number | null;
};

const PLAYABLE_TYPES = [
    'multiple_choice',
    'number_input',
    'select_image',
    'fill_blank',
    'visual_counting',
    'word_problem',
];

const STATUS_LABEL: Record<Activity['status'], string> = {
    not_started: 'Start',
    in_progress: 'Continue',
    completed: 'Play Again',
};

export default function LessonShow({
    lesson,
    activities,
}: {
    lesson: {
        id: number;
        title: string;
        description: string | null;
        learning_objective: string | null;
        points_available: number;
        estimated_minutes: number | null;
    };
    activities: Activity[];
}) {
    return (
        <ChildLayout>
            <Head title={lesson.title} />

            <h1 className="pt-6 text-2xl font-extrabold text-gray-800">{lesson.title}</h1>
            {lesson.description && <p className="mt-2 text-gray-600">{lesson.description}</p>}

            <div className="mt-8 space-y-3">
                {activities.map((activity) => {
                    const playable = PLAYABLE_TYPES.includes(activity.type);

                    return (
                        <div
                            key={activity.id}
                            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                        >
                            <div className="text-left">
                                <p className="font-bold text-gray-800">
                                    {activity.status === 'completed' && '✅ '}
                                    {activity.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {activity.questions_count} questions · {activity.points} pts
                                    {activity.best_score !== null && (
                                        <> · Best: {activity.best_score}/{activity.questions_count}</>
                                    )}
                                </p>
                            </div>

                            {playable ? (
                                <Link
                                    href={
                                        activity.status === 'completed'
                                            ? `${route('child.activities.play', activity.id)}?retry=1`
                                            : route('child.activities.play', activity.id)
                                    }
                                    className="rounded-full bg-sky-600 px-5 py-2 font-semibold text-white hover:bg-sky-700"
                                >
                                    {STATUS_LABEL[activity.status]}
                                </Link>
                            ) : (
                                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-400">
                                    Coming soon
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </ChildLayout>
    );
}
