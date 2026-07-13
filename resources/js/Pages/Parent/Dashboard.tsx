import Card from '@/Components/Card';
import EmptyState from '@/Components/EmptyState';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type ChildProfile = {
    id: number;
    name: string;
    avatar: string | null;
    age_band: string | null;
    grade_level: string | null;
    suspended_at: string | null;
};

const avatarOptions = ['🦊', '🐶', '🐼', '🦄', '🚀', '🌈'];
const ageBandOptions = ['3-5', '6-8', '9-11', '12+'];

export default function Dashboard({
    childProfiles,
    status,
}: {
    childProfiles: ChildProfile[];
    status?: string;
}) {
    const [showAddChild, setShowAddChild] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        pin: '',
        pin_confirmation: '',
        avatar: avatarOptions[0],
        age_band: ageBandOptions[0],
        grade_level: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('parent.children.store'), {
            onSuccess: () => {
                reset();
                setShowAddChild(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Parent Dashboard
                </h2>
            }
        >
            <Head title="Parent Dashboard" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                {status && (
                    <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {status}
                    </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Your Children
                    </h3>
                    <PrimaryButton onClick={() => setShowAddChild(true)}>
                        + Add Child
                    </PrimaryButton>
                </div>

                {childProfiles.length === 0 ? (
                    <EmptyState
                        icon="🧒"
                        title="No child profiles yet"
                        description="Add your first child to get started with lessons and games."
                    >
                        <PrimaryButton onClick={() => setShowAddChild(true)}>
                            + Add Child
                        </PrimaryButton>
                    </EmptyState>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {childProfiles.map((child) => (
                            <Card key={child.id}>
                                <div className="text-4xl">
                                    {child.avatar ?? '🧒'}
                                </div>
                                <h4 className="mt-2 font-bold text-gray-900 dark:text-white">
                                    {child.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {[child.age_band, child.grade_level]
                                        .filter(Boolean)
                                        .join(' · ') || 'No grade set'}
                                </p>
                                {child.suspended_at && (
                                    <p className="mt-1 text-xs font-semibold text-amber-600">
                                        Suspended
                                    </p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={route(
                                            'parent.children.enter',
                                            child.id,
                                        )}
                                        className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                                    >
                                        Play
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    `Remove ${child.name}'s profile? This can't be undone from here.`,
                                                )
                                            ) {
                                                router.delete(
                                                    route(
                                                        'parent.children.destroy',
                                                        child.id,
                                                    ),
                                                );
                                            }
                                        }}
                                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 dark:bg-gray-900"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal show={showAddChild} onClose={() => setShowAddChild(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Add a Child
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Child's name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel value="Avatar" />
                        <div className="mt-1 flex gap-2">
                            {avatarOptions.map((avatar) => (
                                <button
                                    type="button"
                                    key={avatar}
                                    onClick={() => setData('avatar', avatar)}
                                    className={`rounded-full p-2 text-2xl ${data.avatar === avatar ? 'bg-sky-100 dark:bg-sky-900' : ''}`}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="age_band" value="Age range" />
                        <select
                            id="age_band"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.age_band}
                            onChange={(e) =>
                                setData('age_band', e.target.value)
                            }
                        >
                            {ageBandOptions.map((band) => (
                                <option key={band} value={band}>
                                    {band}
                                </option>
                            ))}
                        </select>
                        <InputError
                            message={errors.age_band}
                            className="mt-1"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="pin" value="4-digit PIN" />
                        <TextInput
                            id="pin"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            className="mt-1 block w-full"
                            value={data.pin}
                            onChange={(e) => setData('pin', e.target.value)}
                        />
                        <InputError message={errors.pin} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="pin_confirmation"
                            value="Confirm PIN"
                        />
                        <TextInput
                            id="pin_confirmation"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            className="mt-1 block w-full"
                            value={data.pin_confirmation}
                            onChange={(e) =>
                                setData('pin_confirmation', e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowAddChild(false)}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Add Child
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
