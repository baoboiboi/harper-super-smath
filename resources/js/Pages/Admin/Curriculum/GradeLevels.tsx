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

type GradeLevel = {
    id: number;
    name: string;
    order: number;
    is_active: boolean;
    skills_count: number;
};

export default function GradeLevels({
    gradeLevels,
    status,
}: {
    gradeLevels: GradeLevel[];
    status?: string;
}) {
    const [editing, setEditing] = useState<GradeLevel | 'new' | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        order: 0,
        is_active: true as boolean,
    });

    const openCreate = () => {
        reset();
        setEditing('new');
    };

    const openEdit = (gradeLevel: GradeLevel) => {
        setData({
            name: gradeLevel.name,
            order: gradeLevel.order,
            is_active: gradeLevel.is_active,
        });
        setEditing(gradeLevel);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const onSuccess = () => setEditing(null);

        if (editing && editing !== 'new') {
            patch(route('admin.curriculum.grade-levels.update', editing.id), { onSuccess });
        } else {
            post(route('admin.curriculum.grade-levels.store'), { onSuccess });
        }
    };

    const destroy = (gradeLevel: GradeLevel) => {
        if (confirm(`Delete "${gradeLevel.name}"?`)) {
            router.delete(route('admin.curriculum.grade-levels.destroy', gradeLevel.id));
        }
    };

    return (
        <AdminCurriculumLayout header="Curriculum — Grade Levels">
            <Head title="Admin — Grade Levels" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <PrimaryButton onClick={openCreate}>+ Add Grade Level</PrimaryButton>
            </div>

            <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Skills</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Active</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {gradeLevels.map((gradeLevel) => (
                            <tr key={gradeLevel.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {gradeLevel.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {gradeLevel.skills_count}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {gradeLevel.is_active ? (
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Active</span>
                                    ) : (
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">Inactive</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <button onClick={() => openEdit(gradeLevel)} className="mr-3 font-medium text-sky-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => destroy(gradeLevel)} className="font-medium text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {gradeLevels.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                                    No grade levels yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal show={editing !== null} onClose={() => setEditing(null)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editing === 'new' ? 'Add Grade Level' : 'Edit Grade Level'}
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            placeholder="e.g. Grade 1"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="order" value="Display order" />
                        <TextInput
                            id="order"
                            type="number"
                            className="mt-1 block w-full"
                            value={data.order}
                            onChange={(e) => setData('order', Number(e.target.value))}
                        />
                    </div>

                    <label className="mt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>

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
