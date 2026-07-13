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

const TYPES = [
    'letter_recognition',
    'home_row',
    'key_practice',
    'word_typing',
    'sentence_typing',
    'timed_challenge',
] as const;

type TypingExercise = {
    id: number;
    title: string;
    type: (typeof TYPES)[number];
    target_text: string;
    target_keys: string | null;
    time_limit_seconds: number | null;
    points: number;
    lesson: Option | null;
};

export default function TypingExercises({
    typingExercises,
    lessons,
    status,
}: {
    typingExercises: TypingExercise[];
    lessons: Option[];
    status?: string;
}) {
    const [editing, setEditing] = useState<TypingExercise | 'new' | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        lesson_id: (lessons[0]?.id ?? '') as number | '',
        type: 'word_typing' as (typeof TYPES)[number],
        title: '',
        target_text: '',
        target_keys: '',
        time_limit_seconds: '' as number | '',
        points: 10,
    });

    const openCreate = () => {
        reset();
        setEditing('new');
    };

    const openEdit = (exercise: TypingExercise) => {
        setData({
            lesson_id: exercise.lesson?.id ?? '',
            type: exercise.type,
            title: exercise.title,
            target_text: exercise.target_text,
            target_keys: exercise.target_keys ?? '',
            time_limit_seconds: exercise.time_limit_seconds ?? '',
            points: exercise.points,
        });
        setEditing(exercise);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const onSuccess = () => setEditing(null);

        if (editing && editing !== 'new') {
            patch(route('admin.curriculum.typing-exercises.update', editing.id), { onSuccess });
        } else {
            post(route('admin.curriculum.typing-exercises.store'), { onSuccess });
        }
    };

    const destroy = (exercise: TypingExercise) => {
        if (confirm(`Delete "${exercise.title}"?`)) {
            router.delete(route('admin.curriculum.typing-exercises.destroy', exercise.id));
        }
    };

    return (
        <AdminCurriculumLayout header="Curriculum — Typing Exercises">
            <Head title="Admin — Typing Exercises" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <PrimaryButton onClick={openCreate} disabled={lessons.length === 0}>
                    + Add Typing Exercise
                </PrimaryButton>
            </div>

            {lessons.length === 0 && (
                <p className="mb-4 text-sm text-amber-600">Add a Lesson first before creating typing exercises.</p>
            )}

            <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Lesson</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Target Text</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {typingExercises.map((exercise) => (
                            <tr key={exercise.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{exercise.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{exercise.lesson?.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{exercise.type.replace('_', ' ')}</td>
                                <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {exercise.target_text}
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <button onClick={() => openEdit(exercise)} className="mr-3 font-medium text-sky-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => destroy(exercise)} className="font-medium text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {typingExercises.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                                    No typing exercises yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal show={editing !== null} onClose={() => setEditing(null)}>
                <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editing === 'new' ? 'Add Typing Exercise' : 'Edit Typing Exercise'}
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
                        <InputLabel htmlFor="target_text" value="Target text (what the child types)" />
                        <textarea
                            id="target_text"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.target_text}
                            onChange={(e) => setData('target_text', e.target.value)}
                        />
                        <InputError message={errors.target_text} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="target_keys" value="Target keys (optional, for key practice)" />
                        <TextInput
                            id="target_keys"
                            className="mt-1 block w-full"
                            placeholder="e.g. asdf"
                            value={data.target_keys}
                            onChange={(e) => setData('target_keys', e.target.value)}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="time_limit_seconds" value="Time limit (seconds, optional)" />
                            <TextInput
                                id="time_limit_seconds"
                                type="number"
                                min={5}
                                className="mt-1 block w-full"
                                value={data.time_limit_seconds}
                                onChange={(e) =>
                                    setData('time_limit_seconds', e.target.value ? Number(e.target.value) : '')
                                }
                            />
                        </div>
                        <div>
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
