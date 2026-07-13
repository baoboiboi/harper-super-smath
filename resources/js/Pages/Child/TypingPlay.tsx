import VirtualKeyboard from '@/Components/VirtualKeyboard';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Exercise = {
    id: number;
    lesson_id: number;
    title: string;
    type?: string;
    target_text?: string;
    target_keys?: string | null;
    time_limit_seconds?: number | null;
};

type Summary = {
    wpm: number;
    accuracy_percent: number;
    error_count: number;
    points_earned: number;
};

export default function TypingPlay({
    exercise,
    summary,
}: {
    exercise: Exercise;
    summary?: Summary;
}) {
    if (summary) {
        return (
            <ChildLayout>
                <Head title={exercise.title} />
                <div className="pt-16">
                    <div className="text-7xl">⌨️</div>
                    <h1 className="mt-4 text-3xl font-extrabold text-gray-800">Nice typing!</h1>
                    <div className="mt-6 flex justify-center gap-6 text-lg text-gray-700">
                        <span>🚀 {summary.wpm} WPM</span>
                        <span>🎯 {summary.accuracy_percent}% accurate</span>
                    </div>
                    <p className="mt-2 text-gray-500">⭐ {summary.points_earned} points earned</p>
                    <Link
                        href={route('child.lessons.show', exercise.lesson_id)}
                        className="mt-8 inline-block rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700"
                    >
                        Back to Lesson
                    </Link>
                </div>
            </ChildLayout>
        );
    }

    return <TypingSession exercise={exercise} />;
}

function TypingSession({ exercise }: { exercise: Exercise }) {
    const targetText = exercise.target_text ?? '';
    const timeLimit = exercise.time_limit_seconds ?? null;

    const [typedText, setTypedText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(timeLimit);
    const [submitted, setSubmitted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const typedTextRef = useRef('');

    const submit = (finalText: string) => {
        if (submitted || startTime === null) {
            return;
        }

        setSubmitted(true);
        const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

        router.post(route('child.typing-exercises.complete', exercise.id), {
            typed_text: finalText,
            elapsed_seconds: elapsedSeconds,
        });
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (startTime === null || timeLimit === null || submitted) {
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev === null) {
                    return prev;
                }

                if (prev <= 1) {
                    clearInterval(interval);
                    submit(typedTextRef.current);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startTime, submitted]);

    const handleChange = (value: string) => {
        if (submitted || value.length > targetText.length) {
            return;
        }

        if (startTime === null && value.length > 0) {
            setStartTime(Date.now());
        }

        setTypedText(value);
        typedTextRef.current = value;

        if (value.length === targetText.length) {
            submit(value);
        }
    };

    const currentIndex = typedText.length;
    const activeChar = targetText[currentIndex] ?? null;
    const correctCount = [...typedText].filter((char, i) => char === targetText[i]).length;
    const liveAccuracy = typedText.length > 0 ? Math.round((correctCount / typedText.length) * 100) : 100;

    return (
        <ChildLayout>
            <Head title={exercise.title} />

            <h1 className="pt-6 text-xl font-bold text-gray-700">{exercise.title}</h1>

            <div className="mt-4 flex justify-center gap-6 text-sm font-semibold text-gray-500">
                <span>🎯 {liveAccuracy}% accurate</span>
                {secondsLeft !== null && <span>⏱️ {secondsLeft}s</span>}
            </div>

            <div
                onClick={() => inputRef.current?.focus()}
                className="mt-6 cursor-text rounded-2xl bg-white p-6 text-2xl leading-relaxed tracking-wide shadow-sm"
            >
                {[...targetText].map((char, i) => {
                    const display = char === ' ' ? ' ' : char;
                    let className = 'text-gray-300';

                    if (i < typedText.length) {
                        className = typedText[i] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
                    } else if (i === currentIndex) {
                        className = 'text-gray-700 bg-sky-100 rounded';
                    }

                    return (
                        <span key={i} className={className}>
                            {display}
                        </span>
                    );
                })}
            </div>

            <input
                ref={inputRef}
                type="text"
                value={typedText}
                onChange={(e) => handleChange(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="absolute h-px w-px overflow-hidden opacity-0"
            />

            <VirtualKeyboard activeChar={activeChar} />
        </ChildLayout>
    );
}
