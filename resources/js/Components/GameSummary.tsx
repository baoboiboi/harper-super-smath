import { Link } from '@inertiajs/react';

export default function GameSummary({
    score,
    roundsPlayed,
    onPlayAgain,
}: {
    score: number;
    roundsPlayed: number;
    onPlayAgain: () => void;
}) {
    return (
        <div className="pt-16 text-center">
            <div className="text-7xl">🎉</div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-800">Great job!</h1>
            <p className="mt-4 text-xl text-gray-700">
                You got {score} / {roundsPlayed} correct
            </p>

            <div className="mt-8 flex justify-center gap-3">
                <button
                    onClick={onPlayAgain}
                    className="rounded-full bg-sky-600 px-6 py-3 font-bold text-white shadow hover:bg-sky-700"
                >
                    Play Again
                </button>
                <Link
                    href={route('child.games.index')}
                    className="rounded-full bg-white px-6 py-3 font-bold text-gray-600 shadow-sm hover:bg-gray-50"
                >
                    All Games
                </Link>
            </div>
        </div>
    );
}
