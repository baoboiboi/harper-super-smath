import DifficultySelector, { Difficulty } from '@/Components/DifficultySelector';
import GameSummary from '@/Components/GameSummary';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const ROUNDS_PER_GAME = 8;

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Option = { id: number; label: string; value: number; isDots: boolean };

function generateRound(difficulty: Difficulty): { target: number; options: Option[] } {
    const maxNum = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
    const target = randInt(2, maxNum);
    const useDots = difficulty === 'easy';

    const makeExpression = (value: number): string => {
        if (difficulty === 'hard' && value > 4 && Math.random() > 0.5) {
            const b = randInt(2, Math.min(9, value));
            if (value % b === 0) {
                return `${value / b} × ${b}`;
            }
        }
        if (Math.random() > 0.5 && value > 1) {
            const b = randInt(1, value - 1 >= 1 ? value - 1 : 1);
            return `${value - b} + ${b}`;
        }
        const add = randInt(1, 5);
        return `${value + add} − ${add}`;
    };

    const values = new Set<number>([target]);
    while (values.size < 4) {
        const distractor = Math.max(1, target + randInt(-5, 5));
        values.add(distractor);
    }

    const options: Option[] = [...values]
        .sort(() => Math.random() - 0.5)
        .map((value, index) => ({
            id: index,
            value,
            isDots: useDots,
            label: useDots ? '●'.repeat(value) : makeExpression(value),
        }));

    return { target, options };
}

export default function NumberMatch({ game }: { game: { key: string; name: string; icon: string } }) {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [started, setStarted] = useState(false);
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [current, setCurrent] = useState(() => generateRound('easy'));
    const [startTime, setStartTime] = useState<number | null>(null);

    const start = () => {
        setStarted(true);
        setRound(0);
        setScore(0);
        setFinished(false);
        setCurrent(generateRound(difficulty));
        setStartTime(Date.now());
    };

    const choose = (option: Option) => {
        if (feedback) {
            return;
        }

        const isCorrect = option.value === current.target;
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) {
            setScore((s) => s + 1);
        }

        setTimeout(() => {
            setFeedback(null);
            const nextRound = round + 1;

            if (nextRound >= ROUNDS_PER_GAME) {
                setFinished(true);
                const elapsed = Math.max(1, Math.round((Date.now() - (startTime ?? Date.now())) / 1000));
                router.post(route('child.games.complete', game.key), {
                    difficulty,
                    score: score + (isCorrect ? 1 : 0),
                    rounds_played: ROUNDS_PER_GAME,
                    time_spent_seconds: elapsed,
                });
            } else {
                setRound(nextRound);
                setCurrent(generateRound(difficulty));
            }
        }, 700);
    };

    if (!started) {
        return (
            <ChildLayout>
                <Head title={game.name} />
                <div className="pt-10 text-center">
                    <div className="text-6xl">{game.icon}</div>
                    <h1 className="mt-4 text-2xl font-extrabold text-gray-800">{game.name}</h1>
                    <p className="mt-2 text-gray-600">Pick the answer that matches the number.</p>
                    <div className="mt-6">
                        <DifficultySelector value={difficulty} onChange={setDifficulty} />
                    </div>
                    <button
                        onClick={start}
                        className="mt-8 rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700"
                    >
                        Start
                    </button>
                </div>
            </ChildLayout>
        );
    }

    if (finished) {
        return (
            <ChildLayout>
                <Head title={game.name} />
                <GameSummary score={score} roundsPlayed={ROUNDS_PER_GAME} onPlayAgain={start} />
            </ChildLayout>
        );
    }

    return (
        <ChildLayout>
            <Head title={game.name} />

            <p className="pt-6 text-sm font-semibold text-gray-400">
                Round {round + 1} of {ROUNDS_PER_GAME} · Score {score}
            </p>

            <h1 className="mt-2 text-5xl font-extrabold text-gray-800">{current.target}</h1>

            <div className="mt-8 grid grid-cols-2 gap-4">
                {current.options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => choose(option)}
                        disabled={feedback !== null}
                        className={`rounded-2xl p-6 text-2xl font-bold shadow-sm disabled:opacity-60 ${
                            feedback && option.value === current.target
                                ? 'bg-green-100 text-green-700'
                                : 'bg-white text-gray-800 hover:bg-sky-50'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </ChildLayout>
    );
}
