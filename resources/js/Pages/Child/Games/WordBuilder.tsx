import DifficultySelector, { Difficulty } from '@/Components/DifficultySelector';
import GameSummary from '@/Components/GameSummary';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const ROUNDS_PER_GAME = 6;

const WORD_BANKS: Record<Difficulty, { word: string; emoji: string }[]> = {
    easy: [
        { word: 'CAT', emoji: '🐱' },
        { word: 'DOG', emoji: '🐶' },
        { word: 'SUN', emoji: '☀️' },
        { word: 'HAT', emoji: '🎩' },
        { word: 'CUP', emoji: '☕' },
        { word: 'BOX', emoji: '📦' },
    ],
    medium: [
        { word: 'FROG', emoji: '🐸' },
        { word: 'STAR', emoji: '⭐' },
        { word: 'MOON', emoji: '🌙' },
        { word: 'TREE', emoji: '🌳' },
        { word: 'FISH', emoji: '🐟' },
        { word: 'BIRD', emoji: '🐦' },
    ],
    hard: [
        { word: 'APPLE', emoji: '🍎' },
        { word: 'HOUSE', emoji: '🏠' },
        { word: 'TIGER', emoji: '🐯' },
        { word: 'PLANT', emoji: '🌱' },
        { word: 'CLOUD', emoji: '☁️' },
        { word: 'HEART', emoji: '❤️' },
    ],
};

type Letter = { id: number; char: string; used: boolean };

function scramble(word: string): Letter[] {
    return word
        .split('')
        .map((char, id) => ({ id, char, used: false }))
        .sort(() => Math.random() - 0.5);
}

function pickWord(difficulty: Difficulty) {
    const bank = WORD_BANKS[difficulty];
    return bank[Math.floor(Math.random() * bank.length)];
}

export default function WordBuilder({ game }: { game: { key: string; name: string; icon: string } }) {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [target, setTarget] = useState(() => pickWord('easy'));
    const [letters, setLetters] = useState<Letter[]>(() => scramble(target.word));
    const [answer, setAnswer] = useState<Letter[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);

    const newRound = () => {
        const word = pickWord(difficulty);
        setTarget(word);
        setLetters(scramble(word.word));
        setAnswer([]);
        setFeedback(null);
    };

    const start = () => {
        setStarted(true);
        setFinished(false);
        setRound(0);
        setScore(0);
        newRound();
        setStartTime(Date.now());
    };

    const pick = (letter: Letter) => {
        if (feedback || letter.used) {
            return;
        }

        const newAnswer = [...answer, letter];
        setLetters((prev) => prev.map((l) => (l.id === letter.id ? { ...l, used: true } : l)));
        setAnswer(newAnswer);

        if (newAnswer.length === target.word.length) {
            const attempt = newAnswer.map((l) => l.char).join('');
            const isCorrect = attempt === target.word;
            setFeedback(isCorrect ? 'correct' : 'incorrect');
            if (isCorrect) {
                setScore((s) => s + 1);
            }

            setTimeout(() => {
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
                    newRound();
                }
            }, 900);
        }
    };

    const clear = () => {
        if (feedback) {
            return;
        }
        setLetters((prev) => prev.map((l) => ({ ...l, used: false })));
        setAnswer([]);
    };

    if (!started) {
        return (
            <ChildLayout>
                <Head title={game.name} />
                <div className="pt-10 text-center">
                    <div className="text-6xl">{game.icon}</div>
                    <h1 className="mt-4 text-2xl font-extrabold text-gray-800">{game.name}</h1>
                    <p className="mt-2 text-gray-600">Click the letters in order to spell the word.</p>
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

            <div className="mt-4 text-6xl">{target.emoji}</div>

            <div className="mt-4 flex justify-center gap-2">
                {target.word.split('').map((_, i) => (
                    <span
                        key={i}
                        className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold shadow-sm ${
                            feedback === 'correct'
                                ? 'bg-green-100 text-green-700'
                                : feedback === 'incorrect'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-white text-gray-800'
                        }`}
                    >
                        {answer[i]?.char ?? ''}
                    </span>
                ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                {letters.map((letter) => (
                    <button
                        key={letter.id}
                        onClick={() => pick(letter)}
                        disabled={letter.used || feedback !== null}
                        className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100 text-2xl font-bold text-sky-800 shadow-sm hover:bg-sky-200 disabled:opacity-30"
                    >
                        {letter.char}
                    </button>
                ))}
            </div>

            <button onClick={clear} className="mt-6 text-sm font-medium text-gray-500 hover:text-gray-700">
                Clear
            </button>
        </ChildLayout>
    );
}
