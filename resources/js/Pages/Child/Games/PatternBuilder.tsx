import DifficultySelector, { Difficulty } from '@/Components/DifficultySelector';
import GameSummary from '@/Components/GameSummary';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const ROUNDS_PER_GAME = 8;
const SHAPES = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Round = { sequence: string[]; options: string[]; answer: string };

function generateNumericRound(difficulty: Difficulty): Round {
    const step = difficulty === 'easy' ? randInt(1, 2) : difficulty === 'medium' ? randInt(2, 5) : randInt(2, 3);
    const start = randInt(1, 10);
    const multiply = difficulty === 'hard' && Math.random() > 0.5;

    const sequence: number[] = [];
    let value = start;
    for (let i = 0; i < 4; i++) {
        sequence.push(value);
        value = multiply ? value * 2 : value + step;
    }
    const answer = value;

    const values = new Set<number>([answer]);
    while (values.size < 4) {
        values.add(Math.max(1, answer + randInt(-6, 6)));
    }

    return {
        sequence: sequence.map(String),
        options: [...values].sort(() => Math.random() - 0.5).map(String),
        answer: String(answer),
    };
}

function generateShapeRound(difficulty: Difficulty): Round {
    const unitLength = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    const unit = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, unitLength);
    const sequence: string[] = [];
    for (let i = 0; i < 6; i++) {
        sequence.push(unit[i % unit.length]);
    }
    const answer = unit[6 % unit.length];

    const options = new Set<string>([answer]);
    while (options.size < 4) {
        options.add(SHAPES[randInt(0, SHAPES.length - 1)]);
    }

    return {
        sequence,
        options: [...options].sort(() => Math.random() - 0.5),
        answer,
    };
}

function generateRound(difficulty: Difficulty): Round {
    return Math.random() > 0.5 ? generateNumericRound(difficulty) : generateShapeRound(difficulty);
}

export default function PatternBuilder({ game }: { game: { key: string; name: string; icon: string } }) {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [current, setCurrent] = useState<Round>(() => generateRound('easy'));
    const [startTime, setStartTime] = useState<number | null>(null);

    const start = () => {
        setStarted(true);
        setFinished(false);
        setRound(0);
        setScore(0);
        setCurrent(generateRound(difficulty));
        setStartTime(Date.now());
    };

    const choose = (option: string) => {
        if (feedback) {
            return;
        }

        const isCorrect = option === current.answer;
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
                    <p className="mt-2 text-gray-600">What comes next in the pattern?</p>
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

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-4xl font-bold text-gray-800">
                {current.sequence.map((item, i) => (
                    <span key={i} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                        {item}
                    </span>
                ))}
                <span className="rounded-xl bg-gray-100 px-4 py-3 text-gray-400 shadow-sm">?</span>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-4">
                {current.options.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => choose(option)}
                        disabled={feedback !== null}
                        className={`rounded-2xl p-4 text-3xl font-bold shadow-sm disabled:opacity-60 ${
                            feedback && option === current.answer
                                ? 'bg-green-100 text-green-700'
                                : 'bg-white text-gray-800 hover:bg-sky-50'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </ChildLayout>
    );
}
