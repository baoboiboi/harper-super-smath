import { router } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function ChildLayout({
    childName,
    children,
}: PropsWithChildren<{ childName: string }>) {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fce4ec,#ffffff,#e3f2fd)]">
            <header className="flex items-center justify-between px-6 py-4">
                <span className="text-lg font-bold text-gray-700">
                    ⭐ Hi, {childName}!
                </span>
                <button
                    onClick={() => router.post(route('child.exit'))}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
                >
                    Switch Profile
                </button>
            </header>

            <main className="mx-auto max-w-2xl px-6 pb-16 text-center">
                {children}
            </main>
        </div>
    );
}
