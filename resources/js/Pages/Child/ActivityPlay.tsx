import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Option = { id: number; label: string };

type Question = {
    id: number;
    type: string;
    prompt: string;
    hint: string | null;
    options: Option[];
};

type Feedback = {
    is_correct: boolean;
    explanation: string | null;
    correct_label: string | null;
};

type Summary = {
    total_questions: number;
    correct_count: number;
    points_earned: number;
    accuracy: number;
};

export default function ActivityPlay({
    activity,
    question,
    feedback,
    summary,
    progress,
}: {
    activity: { id: number; lesson_id: number; title: string };
    question?: Question;
    feedback?: Feedback;
    summary?: Summary;
    progress?: { answered: number; total: number };
}) {
    if (feedback) {
        return (
            <ChildLayout>
                <Head title={activity.title} />
                <div className="pt-16">
                    <div className="text-7xl">{feedback.is_correct ? '🎉' : '❌'}</div>
                    <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
                        {feedback.is_correct ? 'Great job!' : 'Almost!'}
                    </h1>
                    {!feedback.is_correct && feedback.correct_label && (
                        <p className="mt-2 text-lg text-gray-600">
                            The correct answer was <strong>{feedback.correct_label}</strong>.
                        </p>
                    )}
                    {feedback.explanation && (
                        <p className="mt-2 text-gray-500">{feedback.explanation}</p>
                    )}
                    <Link
                        href={route('child.activities.play', activity.id)}
                        className="mt-8 inline-block rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700"
                    >
                        Continue
                    </Link>
                </div>
            </ChildLayout>
        );
    }

    if (summary) {
        return (
            <ChildLayout>
                <Head title={activity.title} />
                <div className="pt-16">
                    <div className="text-7xl">📊</div>
                    <h1 className="mt-4 text-3xl font-extrabold text-gray-800">Activity Complete!</h1>
                    <p className="mt-4 text-xl text-gray-700">
                        {summary.correct_count} / {summary.total_questions} correct
                    </p>
                    <p className="mt-1 text-lg text-gray-500">
                        ⭐ {summary.points_earned} points · {summary.accuracy}% accuracy
                    </p>
                    <Link
                        href={route('child.lessons.show', activity.lesson_id)}
                        className="mt-8 inline-block rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700"
                    >
                        Back to Lesson
                    </Link>
                </div>
            </ChildLayout>
        );
    }

    if (question) {
        return <QuestionCard activityId={activity.id} question={question} progress={progress} />;
    }

    return null;
}

function QuestionCard({
    activityId,
    question,
    progress,
}: {
    activityId: number;
    question: Question;
    progress?: { answered: number; total: number };
}) {
    const [showHint, setShowHint] = useState(false);
    const [answerText, setAnswerText] = useState('');
    const [processing, setProcessing] = useState(false);

    const submitOption = (optionId: number) => {
        if (processing) {
            return;
        }

        setProcessing(true);
        router.post(
            route('child.activities.answer', activityId),
            { option_id: optionId, used_hint: showHint },
            { onFinish: () => setProcessing(false) },
        );
    };

    const submitText: FormEventHandler = (e) => {
        e.preventDefault();

        if (!answerText.trim() || processing) {
            return;
        }

        setProcessing(true);
        router.post(
            route('child.activities.answer', activityId),
            { answer_text: answerText, used_hint: showHint },
            { onFinish: () => setProcessing(false) },
        );
    };

    return (
        <ChildLayout>
            <Head title="Question" />

            {progress && (
                <p className="pt-6 text-sm font-semibold text-gray-400">
                    Question {progress.answered + 1} of {progress.total}
                </p>
            )}

            <h1 className="mt-2 text-3xl font-extrabold text-gray-800">{question.prompt}</h1>

            {question.hint && (
                <div className="mt-4">
                    {showHint ? (
                        <p className="rounded-xl bg-amber-50 p-3 text-amber-700">💡 {question.hint}</p>
                    ) : (
                        <button
                            onClick={() => setShowHint(true)}
                            className="text-sm font-medium text-amber-600 hover:underline"
                        >
                            💡 Show a hint
                        </button>
                    )}
                </div>
            )}

            {question.options.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-4">
                    {question.options.map((option) => (
                        <button
                            key={option.id}
                            disabled={processing}
                            onClick={() => submitOption(option.id)}
                            className="rounded-2xl bg-white p-6 text-2xl font-bold text-gray-800 shadow-sm hover:bg-sky-50 hover:shadow-md disabled:opacity-50"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            ) : (
                <form onSubmit={submitText} className="mt-8">
                    <input
                        type="text"
                        autoFocus
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="w-full rounded-2xl border-gray-300 p-4 text-center text-2xl shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700 disabled:opacity-50"
                    >
                        Submit
                    </button>
                </form>
            )}
        </ChildLayout>
    );
}
