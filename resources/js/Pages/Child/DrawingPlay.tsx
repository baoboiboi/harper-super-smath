import Canvas, { CanvasHandle } from '@/Components/Canvas';
import ChildLayout from '@/Layouts/ChildLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

type Prompt = {
    id: number;
    lesson_id: number;
    title: string;
    type: 'trace_letter' | 'trace_number' | 'trace_shape' | 'coloring_page';
    instructions: string | null;
    template_text: string | null;
};

export default function DrawingPlay({ prompt }: { prompt: Prompt }) {
    const canvasRef = useRef<CanvasHandle>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const save = () => {
        const image = canvasRef.current?.exportImage();
        if (!image || saving) {
            return;
        }

        setSaving(true);
        router.post(
            route('child.artworks.store'),
            { title: prompt.title, image, drawing_prompt_id: prompt.id },
            {
                onSuccess: () => setSaved(true),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <ChildLayout>
            <Head title={prompt.title} />

            <h1 className="pt-6 text-2xl font-extrabold text-gray-800">{prompt.title}</h1>
            {prompt.instructions && <p className="mt-2 text-gray-600">{prompt.instructions}</p>}

            <div className="mt-6">
                <Canvas
                    ref={canvasRef}
                    templateType={prompt.type === 'coloring_page' ? null : prompt.type}
                    templateText={prompt.template_text}
                />
            </div>

            {saved ? (
                <div className="mt-6">
                    <p className="text-lg font-bold text-green-600">🎉 Saved to your gallery!</p>
                    <Link
                        href={route('child.lessons.show', prompt.lesson_id)}
                        className="mt-4 inline-block rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700"
                    >
                        Back to Lesson
                    </Link>
                </div>
            ) : (
                <button
                    onClick={save}
                    disabled={saving}
                    className="mt-6 rounded-full bg-sky-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-sky-700 disabled:opacity-50"
                >
                    💾 Save Artwork
                </button>
            )}
        </ChildLayout>
    );
}
