import EmptyState from '@/Components/EmptyState';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link, router } from '@inertiajs/react';

type Artwork = {
    id: number;
    title: string;
    url: string;
    created_at: string;
};

export default function Gallery({ artworks }: { artworks: Artwork[] }) {
    const destroy = (artwork: Artwork) => {
        if (confirm(`Delete "${artwork.title}"?`)) {
            router.delete(route('child.artworks.destroy', artwork.id));
        }
    };

    return (
        <ChildLayout>
            <Head title="My Gallery" />

            <div className="flex items-center justify-between pt-6">
                <h1 className="text-2xl font-extrabold text-gray-800">🖼️ My Gallery</h1>
                <Link
                    href={route('child.draw')}
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                    + New Drawing
                </Link>
            </div>

            {artworks.length === 0 ? (
                <div className="mt-10">
                    <EmptyState icon="🎨" title="No artwork yet" description="Draw something and save it here!" />
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {artworks.map((artwork) => (
                        <div key={artwork.id} className="rounded-2xl bg-white p-2 shadow-sm">
                            <img src={artwork.url} alt={artwork.title} className="aspect-[4/3] w-full rounded-xl object-cover" />
                            <p className="mt-2 truncate text-sm font-semibold text-gray-700">{artwork.title}</p>
                            <button
                                onClick={() => destroy(artwork)}
                                className="mt-1 text-xs font-medium text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </ChildLayout>
    );
}
