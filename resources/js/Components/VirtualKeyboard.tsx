const ROWS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const HOME_ROW_KEYS = new Set(['a', 's', 'd', 'f', 'j', 'k', 'l']);

export default function VirtualKeyboard({ activeChar }: { activeChar: string | null }) {
    const normalized = activeChar?.toLowerCase() ?? null;
    const isSpace = activeChar === ' ';

    return (
        <div className="mt-8 select-none">
            <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                {ROWS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1.5" style={{ marginLeft: rowIndex * 12 }}>
                        {row.map((key) => (
                            <div
                                key={key}
                                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold uppercase shadow-sm transition-colors ${
                                    normalized === key
                                        ? 'bg-sky-500 text-white'
                                        : HOME_ROW_KEYS.has(key)
                                          ? 'bg-amber-50 text-gray-500'
                                          : 'bg-white text-gray-400'
                                }`}
                            >
                                {key}
                            </div>
                        ))}
                    </div>
                ))}
                <div
                    className={`h-10 w-64 rounded-lg shadow-sm transition-colors ${
                        isSpace ? 'bg-sky-500' : 'bg-white'
                    }`}
                />
            </div>
        </div>
    );
}
