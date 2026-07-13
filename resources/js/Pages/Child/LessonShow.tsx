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

type TypingExercise = {
    id: number;
    title: string;
    type: string;
    points: number;
    attempts_count: number;
    best_wpm: number | null;
    best_accuracy: number | null;
};

type DrawingPrompt = {
    id: number;
    title: string;
    type: string;
    points: number;
    attempts_count: number;
};

const PLAYABLE_TYPES = [
    'multiple_choice',
    'number_input',
    'select_image',
    'fill_blank',
    'visual_counting',
    'word_problem',
];

const PLAYABLE_DRAWING_TYPES = ['trace_letter', 'trace_number', 'trace_shape'];

const STATUS_LABEL: Record<Activity['status'], string> = {
    not_started: 'Start',
    in_progress: 'Continue',
    completed: 'Play Again',
};

export default function LessonShow({
    lesson,
    activities,
    typingExercises,
    drawingPrompts,
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
    typingExercises: TypingExercise[];
    drawingPrompts: DrawingPrompt[];
}) {
    return (
        <ChildLayout>
            <Head title={lesson.title} />

            <h1 className="pt-6 text-2xl font-extrabold text-gray-800">{lesson.title}</h1>
            {lesson.description && <p className="mt-2 text-gray-600">{lesson.description}</p>}

            {activities.length > 0 && (
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
            )}

            {typingExercises.length > 0 && (
                <div className="mt-8 space-y-3">
                    <h2 className="text-left text-sm font-semibold uppercase text-gray-400">
                        ⌨️ Typing Practice
                    </h2>
                    {typingExercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                        >
                            <div className="text-left">
                                <p className="font-bold text-gray-800">
                                    {exercise.attempts_count > 0 && '✅ '}
                                    {exercise.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {exercise.points} pts
                                    {exercise.best_wpm !== null && (
                                        <> · Best: {exercise.best_wpm} WPM, {exercise.best_accuracy}% accurate</>
                                    )}
                                </p>
                            </div>

                            <Link
                                href={route('child.typing-exercises.play', exercise.id)}
                                className="rounded-full bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
                            >
                                {exercise.attempts_count > 0 ? 'Practice Again' : 'Start'}
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {drawingPrompts.length > 0 && (
                <div className="mt-8 space-y-3">
                    <h2 className="text-left text-sm font-semibold uppercase text-gray-400">
                        🎨 Drawing
                    </h2>
                    {drawingPrompts.map((prompt) => {
                        const playable = PLAYABLE_DRAWING_TYPES.includes(prompt.type);

                        return (
                            <div
                                key={prompt.id}
                                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-gray-800">
                                        {prompt.attempts_count > 0 && '✅ '}
                                        {prompt.title}
                                    </p>
                                    <p className="text-sm text-gray-500">{prompt.points} pts</p>
                                </div>

                                {playable ? (
                                    <Link
                                        href={route('child.drawing-prompts.play', prompt.id)}
                                        className="rounded-full bg-pink-600 px-5 py-2 font-semibold text-white hover:bg-pink-700"
                                    >
                                        {prompt.attempts_count > 0 ? 'Draw Again' : 'Start'}
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
            )}
        </ChildLayout>
    );
}
