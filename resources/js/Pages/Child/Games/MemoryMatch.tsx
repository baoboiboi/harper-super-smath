import DifficultySelector, { Difficulty } from '@/Components/DifficultySelector';
import GameSummary from '@/Components/GameSummary';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const EMOJIS = ['🍎', '🐶', '🌟', '🚗', '🌈', '🐱', '🎈', '🍩', '⚽', '🦋', '🐢', '🍓'];

type Card = { id: number; pairId: number; symbol: string; flipped: boolean; matched: boolean };

function pairCountFor(difficulty: Difficulty): number {
    return difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
}

function generateCards(difficulty: Difficulty): Card[] {
    const pairs = pairCountFor(difficulty);
    const symbols = EMOJIS.slice(0, pairs);
    const cards: Card[] = symbols.flatMap((symbol, pairId) => [
        { id: pairId * 2, pairId, symbol, flipped: false, matched: false },
        { id: pairId * 2 + 1, pairId, symbol, flipped: false, matched: false },
    ]);

    return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryMatch({ game }: { game: { key: string; name: string; icon: string } }) {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [cards, setCards] = useState<Card[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [matches, setMatches] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [locked, setLocked] = useState(false);

    const start = () => {
        setCards(generateCards(difficulty));
        setSelected([]);
        setAttempts(0);
        setMatches(0);
        setStarted(true);
        setFinished(false);
        setStartTime(Date.now());
    };

    const flip = (card: Card) => {
        if (locked || card.flipped || card.matched || selected.length === 2) {
            return;
        }

        const newCards = cards.map((c) => (c.id === card.id ? { ...c, flipped: true } : c));
        const newSelected = [...selected, card.id];
        setCards(newCards);
        setSelected(newSelected);

        if (newSelected.length === 2) {
            setLocked(true);
            setAttempts((a) => a + 1);
            const [firstId, secondId] = newSelected;
            const first = newCards.find((c) => c.id === firstId)!;
            const second = newCards.find((c) => c.id === secondId)!;

            if (first.pairId === second.pairId) {
                setTimeout(() => {
                    const matchedCards = newCards.map((c) =>
                        c.pairId === first.pairId ? { ...c, matched: true } : c,
                    );
                    setCards(matchedCards);
                    setSelected([]);
                    setLocked(false);
                    const newMatchCount = matches + 1;
                    setMatches(newMatchCount);

                    if (newMatchCount === pairCountFor(difficulty)) {
                        setFinished(true);
                        const elapsed = Math.max(1, Math.round((Date.now() - (startTime ?? Date.now())) / 1000));
                        router.post(route('child.games.complete', game.key), {
                            difficulty,
                            score: newMatchCount,
                            rounds_played: attempts + 1,
                            time_spent_seconds: elapsed,
                        });
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c)),
                    );
                    setSelected([]);
                    setLocked(false);
                }, 800);
            }
        }
    };

    if (!started) {
        return (
            <ChildLayout>
                <Head title={game.name} />
                <div className="pt-10 text-center">
                    <div className="text-6xl">{game.icon}</div>
                    <h1 className="mt-4 text-2xl font-extrabold text-gray-800">{game.name}</h1>
                    <p className="mt-2 text-gray-600">Flip two cards to find a matching pair.</p>
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
                <GameSummary score={matches} roundsPlayed={attempts} onPlayAgain={start} />
            </ChildLayout>
        );
    }

    const cols = 4;

    return (
        <ChildLayout>
            <Head title={game.name} />

            <p className="pt-6 text-sm font-semibold text-gray-400">
                Matches {matches} / {pairCountFor(difficulty)} · Attempts {attempts}
            </p>

            <div className="mx-auto mt-6 grid max-w-md gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => flip(card)}
                        className={`flex aspect-square items-center justify-center rounded-2xl text-3xl shadow-sm ${
                            card.matched
                                ? 'bg-green-100'
                                : card.flipped
                                  ? 'bg-white'
                                  : 'bg-sky-500 hover:bg-sky-600'
                        }`}
                    >
                        {card.flipped || card.matched ? card.symbol : ''}
                    </button>
                ))}
            </div>
        </ChildLayout>
    );
}
