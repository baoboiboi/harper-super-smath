import Card from '@/Components/Card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AdminCurriculumLayout from '@/Layouts/AdminCurriculumLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Option = { id: number; title?: string; name?: string };

const STATUSES = ['draft', 'under_review', 'published', 'archived'] as const;

type Lesson = {
    id: number;
    title: string;
    description: string | null;
    difficulty: number;
    estimated_minutes: number | null;
    points_available: number;
    order: number;
    status: (typeof STATUSES)[number];
    unit: Option | null;
    activities_count: number;
};

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-600',
        under_review: 'bg-amber-100 text-amber-700',
        published: 'bg-green-100 text-green-700',
        archived: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colors[status] ?? ''}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function Lessons({
    lessons,
    units,
    skills,
    status,
}: {
    lessons: Lesson[];
    units: Option[];
    skills: Option[];
    status?: string;
}) {
    const [editing, setEditing] = useState<Lesson | 'new' | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        unit_id: (units[0]?.id ?? '') as number | '',
        required_skill_id: '' as number | '',
        title: '',
        description: '',
        difficulty: 1,
        estimated_minutes: 10,
        points_available: 10,
        status: 'draft' as (typeof STATUSES)[number],
    });

    const openCreate = () => {
        reset();
        setEditing('new');
    };

    const openEdit = (lesson: Lesson) => {
        setData({
            unit_id: lesson.unit?.id ?? '',
            required_skill_id: '',
            title: lesson.title,
            description: lesson.description ?? '',
            difficulty: lesson.difficulty,
            estimated_minutes: lesson.estimated_minutes ?? 10,
            points_available: lesson.points_available,
            status: lesson.status,
        });
        setEditing(lesson);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const onSuccess = () => setEditing(null);

        if (editing && editing !== 'new') {
            patch(route('admin.curriculum.lessons.update', editing.id), { onSuccess });
        } else {
            post(route('admin.curriculum.lessons.store'), { onSuccess });
        }
    };

    const destroy = (lesson: Lesson) => {
        if (confirm(`Delete "${lesson.title}"? This also removes its activities and questions.`)) {
            router.delete(route('admin.curriculum.lessons.destroy', lesson.id));
        }
    };

    return (
        <AdminCurriculumLayout header="Curriculum — Lessons">
            <Head title="Admin — Lessons" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <PrimaryButton onClick={openCreate} disabled={units.length === 0}>
                    + Add Lesson
                </PrimaryButton>
            </div>

            {units.length === 0 && (
                <p className="mb-4 text-sm text-amber-600">Add a Unit first before creating lessons.</p>
            )}

            <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Unit</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Activities</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {lessons.map((lesson) => (
                            <tr key={lesson.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    <Link
                                        href={route('admin.curriculum.lessons.show', lesson.id)}
                                        className="text-sky-600 hover:underline"
                                    >
                                        {lesson.title}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{lesson.unit?.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{lesson.activities_count}</td>
                                <td className="px-4 py-3 text-sm">
                                    <StatusBadge status={lesson.status} />
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <button onClick={() => openEdit(lesson)} className="mr-3 font-medium text-sky-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => destroy(lesson)} className="font-medium text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {lessons.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                                    No lessons yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal show={editing !== null} onClose={() => setEditing(null)}>
                <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editing === 'new' ? 'Add Lesson' : 'Edit Lesson'}
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="unit_id" value="Unit" />
                        <select
                            id="unit_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.unit_id}
                            onChange={(e) => setData('unit_id', Number(e.target.value))}
                        >
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.title}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.unit_id} className="mt-1" />
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
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            rows={2}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="required_skill_id" value="Required prior skill (optional)" />
                        <select
                            id="required_skill_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.required_skill_id}
                            onChange={(e) =>
                                setData('required_skill_id', e.target.value ? Number(e.target.value) : '')
                            }
                        >
                            <option value="">None</option>
                            {skills.map((skill) => (
                                <option key={skill.id} value={skill.id}>
                                    {skill.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div>
                            <InputLabel htmlFor="difficulty" value="Difficulty (1-5)" />
                            <TextInput
                                id="difficulty"
                                type="number"
                                min={1}
                                max={5}
                                className="mt-1 block w-full"
                                value={data.difficulty}
                                onChange={(e) => setData('difficulty', Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="estimated_minutes" value="Minutes" />
                            <TextInput
                                id="estimated_minutes"
                                type="number"
                                min={1}
                                className="mt-1 block w-full"
                                value={data.estimated_minutes}
                                onChange={(e) => setData('estimated_minutes', Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="points_available" value="Points" />
                            <TextInput
                                id="points_available"
                                type="number"
                                min={0}
                                className="mt-1 block w-full"
                                value={data.points_available}
                                onChange={(e) => setData('points_available', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="status" value="Status" />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as (typeof STATUSES)[number])}
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
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
