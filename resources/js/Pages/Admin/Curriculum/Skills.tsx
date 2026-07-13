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

type Option = { id: number; name: string };

type Skill = {
    id: number;
    name: string;
    description: string | null;
    order: number;
    is_active: boolean;
    subject: Option | null;
    grade_level: Option | null;
    courses_count: number;
};

export default function Skills({
    skills,
    subjects,
    gradeLevels,
    status,
}: {
    skills: Skill[];
    subjects: Option[];
    gradeLevels: Option[];
    status?: string;
}) {
    const [editing, setEditing] = useState<Skill | 'new' | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        subject_id: (subjects[0]?.id ?? '') as number | '',
        grade_level_id: '' as number | '',
        name: '',
        description: '',
        order: 0,
        is_active: true as boolean,
    });

    const openCreate = () => {
        reset();
        setEditing('new');
    };

    const openEdit = (skill: Skill) => {
        setData({
            subject_id: skill.subject?.id ?? '',
            grade_level_id: skill.grade_level?.id ?? '',
            name: skill.name,
            description: skill.description ?? '',
            order: skill.order,
            is_active: skill.is_active,
        });
        setEditing(skill);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const onSuccess = () => setEditing(null);

        if (editing && editing !== 'new') {
            patch(route('admin.curriculum.skills.update', editing.id), { onSuccess });
        } else {
            post(route('admin.curriculum.skills.store'), { onSuccess });
        }
    };

    const destroy = (skill: Skill) => {
        if (confirm(`Delete "${skill.name}"? This also removes every course, unit, and lesson under it.`)) {
            router.delete(route('admin.curriculum.skills.destroy', skill.id));
        }
    };

    return (
        <AdminCurriculumLayout header="Curriculum — Skills">
            <Head title="Admin — Skills" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <PrimaryButton onClick={openCreate} disabled={subjects.length === 0}>
                    + Add Skill
                </PrimaryButton>
            </div>

            {subjects.length === 0 && (
                <p className="mb-4 text-sm text-amber-600">
                    Add a Subject first before creating skills.
                </p>
            )}

            <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Grade</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Courses</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {skills.map((skill) => (
                            <tr key={skill.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{skill.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{skill.subject?.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{skill.grade_level?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{skill.courses_count}</td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <button onClick={() => openEdit(skill)} className="mr-3 font-medium text-sky-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => destroy(skill)} className="font-medium text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {skills.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                                    No skills yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal show={editing !== null} onClose={() => setEditing(null)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editing === 'new' ? 'Add Skill' : 'Edit Skill'}
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="subject_id" value="Subject" />
                        <select
                            id="subject_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.subject_id}
                            onChange={(e) => setData('subject_id', Number(e.target.value))}
                        >
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.subject_id} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="grade_level_id" value="Grade level (optional)" />
                        <select
                            id="grade_level_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.grade_level_id}
                            onChange={(e) =>
                                setData('grade_level_id', e.target.value ? Number(e.target.value) : '')
                            }
                        >
                            <option value="">No specific grade</option>
                            {gradeLevels.map((gradeLevel) => (
                                <option key={gradeLevel.id} value={gradeLevel.id}>
                                    {gradeLevel.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-1" />
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
