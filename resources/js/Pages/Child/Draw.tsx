import Canvas, { CanvasHandle } from '@/Components/Canvas';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function Draw() {
    const canvasRef = useRef<CanvasHandle>(null);
    const [title, setTitle] = useState('My Drawing');
    const [saving, setSaving] = useState(false);

    const save = () => {
        const image = canvasRef.current?.exportImage();
        if (!image || saving) {
            return;
        }

        setSaving(true);
        router.post(
            route('child.artworks.store'),
            { title, image, drawing_prompt_id: null },
            { onFinish: () => setSaving(false) },
        );
    };

    return (
        <ChildLayout>
            <Head title="Draw" />

            <div className="flex items-center justify-between pt-6">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-full border-none bg-white px-4 py-2 text-lg font-bold text-gray-800 shadow-sm"
                />
                <Link href={route('child.gallery')} className="text-sm text-gray-500 hover:text-gray-700">
                    🖼️ My Gallery
                </Link>
            </div>

            <div className="mt-6">
                <Canvas ref={canvasRef} />
            </div>

            <button
                onClick={save}
                disabled={saving}
                className="mt-6 rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700 disabled:opacity-50"
            >
                💾 Save Artwork
            </button>
        </ChildLayout>
    );
}
