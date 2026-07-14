export type Difficulty = 'easy' | 'medium' | 'hard';

const OPTIONS: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: '🐣 Easy' },
    { value: 'medium', label: '🐥 Medium' },
    { value: 'hard', label: '🦅 Hard' },
];

export default function DifficultySelector({
    value,
    onChange,
}: {
    value: Difficulty;
    onChange: (difficulty: Difficulty) => void;
}) {
    return (
        <div className="flex justify-center gap-2">
            {OPTIONS.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        value === option.value
                            ? 'bg-sky-600 text-white'
                            : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
