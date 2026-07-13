import Card from '@/Components/Card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AdminCurriculumLayout from '@/Layouts/AdminCurriculumLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Option = { id: number; title: string };

const TYPES = ['trace_letter', 'trace_number', 'trace_shape', 'coloring_page'] as const;

type DrawingPrompt = {
    id: number;
    title: string;
    type: (typeof TYPES)[number];
    instructions: string | null;
    template_text: string | null;
    points: number;
    lesson: Option | null;
};

export default function DrawingPrompts({
    drawingPrompts,
    lessons,
    status,
}: {
    drawingPrompts: DrawingPrompt[];
    lessons: Option[];
    status?: string;
}) {
    const [editing, setEditing] = useState<DrawingPrompt | 'new' | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        lesson_id: (lessons[0]?.id ?? '') as number | '',
        type: 'trace_letter' as (typeof TYPES)[number],
        title: '',
        instructions: '',
        template_text: '',
        points: 10,
    });

    const openCreate = () => {
        reset();
        setEditing('new');
    };

    const openEdit = (prompt: DrawingPrompt) => {
        setData({
            lesson_id: prompt.lesson?.id ?? '',
            type: prompt.type,
            title: prompt.title,
            instructions: prompt.instructions ?? '',
            template_text: prompt.template_text ?? '',
            points: prompt.points,
        });
        setEditing(prompt);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const onSuccess = () => setEditing(null);

        if (editing && editing !== 'new') {
            patch(route('admin.curriculum.drawing-prompts.update', editing.id), { onSuccess });
        } else {
            post(route('admin.curriculum.drawing-prompts.store'), { onSuccess });
        }
    };

    const destroy = (prompt: DrawingPrompt) => {
        if (confirm(`Delete "${prompt.title}"?`)) {
            router.delete(route('admin.curriculum.drawing-prompts.destroy', prompt.id));
        }
    };

    return (
        <AdminCurriculumLayout header="Curriculum — Drawing Prompts">
            <Head title="Admin — Drawing Prompts" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <PrimaryButton onClick={openCreate} disabled={lessons.length === 0}>
                    + Add Drawing Prompt
                </PrimaryButton>
            </div>

            {lessons.length === 0 && (
                <p className="mb-4 text-sm text-amber-600">Add a Lesson first before creating drawing prompts.</p>
            )}

            <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Lesson</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Template</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {drawingPrompts.map((prompt) => (
                            <tr key={prompt.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{prompt.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{prompt.lesson?.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{prompt.type.replace('_', ' ')}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{prompt.template_text}</td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <button onClick={() => openEdit(prompt)} className="mr-3 font-medium text-sky-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => destroy(prompt)} className="font-medium text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {drawingPrompts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                                    No drawing prompts yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal show={editing !== null} onClose={() => setEditing(null)}>
                <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editing === 'new' ? 'Add Drawing Prompt' : 'Edit Drawing Prompt'}
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="lesson_id" value="Lesson" />
                        <select
                            id="lesson_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.lesson_id}
                            onChange={(e) => setData('lesson_id', Number(e.target.value))}
                        >
                            {lessons.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                    {lesson.title}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.lesson_id} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="title" value="Title" />
                        <TextInput
                            id="title"
                            className="mt-1 block w-full"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="type" value="Type" />
                        <select
                            id="type"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as (typeof TYPES)[number])}
                        >
                            {TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="template_text" value="Template text (the letter/number/shape to trace)" />
                        <TextInput
                            id="template_text"
                            className="mt-1 block w-full"
                            placeholder="e.g. A, or 7, or circle"
                            value={data.template_text}
                            onChange={(e) => setData('template_text', e.target.value)}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Only used for trace_letter / trace_number / trace_shape. Coloring pages aren&apos;t playable yet (need real artwork assets).
                        </p>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="instructions" value="Instructions" />
                        <textarea
                            id="instructions"
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.instructions}
                            onChange={(e) => setData('instructions', e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="points" value="Points" />
                        <TextInput
                            id="points"
                            type="number"
                            min={0}
                            className="mt-1 block w-full"
                            value={data.points}
                            onChange={(e) => setData('points', Number(e.target.value))}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setEditing(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminCurriculumLayout>
    );
}
