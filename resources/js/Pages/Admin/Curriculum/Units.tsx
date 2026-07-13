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

const STATUSES = ['draft', 'under_review', 'published', 'archived'] as const;

type Unit = {
    id: number;
    title: string;
    description: string | null;
    order: number;
    status: (typeof STATUSES)[number];
    course: Option | null;
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

export default function Units({
    units,
    courses,
    status,
}: {
    units: Unit[];
    courses: Option[];
    status?: string;
}) {
    const [editing, setEditing] = useState<Unit | 'new' | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        course_id: (courses[0]?.id ?? '') as number | '',
        title: '',
        description: '',
        order: 0,
        status: 'draft' as (typeof STATUSES)[number],
    });

    const openCreate = () => {
        reset();
        setEditing('new');
    };

    const openEdit = (unit: Unit) => {
        setData({
            course_id: unit.course?.id ?? '',
            title: unit.title,
            description: unit.description ?? '',
            order: unit.order,
            status: unit.status,
        });
        setEditing(unit);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const onSuccess = () => setEditing(null);

        if (editing && editing !== 'new') {
            patch(route('admin.curriculum.units.update', editing.id), { onSuccess });
        } else {
            post(route('admin.curriculum.units.store'), { onSuccess });
        }
    };

    const destroy = (unit: Unit) => {
        if (confirm(`Delete "${unit.title}"? This also removes every lesson under it.`)) {
            router.delete(route('admin.curriculum.units.destroy', unit.id));
        }
    };

    return (
        <AdminCurriculumLayout header="Curriculum — Units">
            <Head title="Admin — Units" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <PrimaryButton onClick={openCreate} disabled={courses.length === 0}>
                    + Add Unit
                </PrimaryButton>
            </div>

            {courses.length === 0 && (
                <p className="mb-4 text-sm text-amber-600">Add a Course first before creating units.</p>
            )}

            <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Course</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {units.map((unit) => (
                            <tr key={unit.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{unit.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{unit.course?.title}</td>
                                <td className="px-4 py-3 text-sm">
                                    <StatusBadge status={unit.status} />
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <button onClick={() => openEdit(unit)} className="mr-3 font-medium text-sky-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => destroy(unit)} className="font-medium text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {units.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                                    No units yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal show={editing !== null} onClose={() => setEditing(null)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editing === 'new' ? 'Add Unit' : 'Edit Unit'}
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="course_id" value="Course" />
                        <select
                            id="course_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.course_id}
                            onChange={(e) => setData('course_id', Number(e.target.value))}
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.course_id} className="mt-1" />
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
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
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
