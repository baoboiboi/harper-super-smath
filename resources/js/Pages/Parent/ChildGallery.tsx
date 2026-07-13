import Card from '@/Components/Card';
import EmptyState from '@/Components/EmptyState';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

type Artwork = {
    id: number;
    title: string;
    url: string;
    created_at: string;
};

export default function ChildGallery({
    child,
    artworks,
}: {
    child: { id: number; name: string; avatar: string | null };
    artworks: Artwork[];
}) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {child.avatar} {child.name}&apos;s Gallery
                </h2>
            }
        >
            <Head title={`${child.name}'s Gallery`} />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <Link href={route('parent.dashboard')} className="text-sm text-sky-600 hover:underline">
                    &larr; Back to dashboard
                </Link>

                {artworks.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState icon="🎨" title="No artwork yet" description={`${child.name} hasn't saved any drawings yet.`} />
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {artworks.map((artwork) => (
                            <Card key={artwork.id} className="p-2">
                                <img
                                    src={artwork.url}
                                    alt={artwork.title}
                                    className="aspect-[4/3] w-full rounded-xl object-cover"
                                />
                                <p className="mt-2 truncate text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {artwork.title}
                                </p>
                                <a
                                    href={artwork.url}
                                    download={`${artwork.title}.png`}
                                    className="mt-1 inline-block text-xs font-medium text-sky-600 hover:underline"
                                >
                                    Download
                                </a>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
