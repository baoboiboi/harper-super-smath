import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link } from '@inertiajs/react';

type Game = {
    key: string;
    name: string;
    icon: string;
    description: string;
    best_score: number | null;
};

export default function Games({ games, status }: { games: Game[]; status?: string }) {
    return (
        <ChildLayout>
            <Head title="Games" />

            <h1 className="pt-6 text-2xl font-extrabold text-gray-800">🎮 Games</h1>

            {status && (
                <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
                {games.map((game) => (
                    <Link
                        key={game.key}
                        href={route('child.games.play', game.key)}
                        className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 text-center shadow-sm hover:shadow-md"
                    >
                        <span className="text-5xl">{game.icon}</span>
                        <span className="text-lg font-bold text-gray-800">{game.name}</span>
                        <span className="text-xs text-gray-500">{game.description}</span>
                        {game.best_score !== null && (
                            <span className="mt-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                Best: {game.best_score}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            <div className="mt-8">
                <Link href={route('child.dashboard')} className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Back to dashboard
                </Link>
            </div>
        </ChildLayout>
    );
}
