import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function EnterChildPin({
    childProfile,
}: {
    childProfile: { id: number; name: string; avatar: string | null };
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        pin: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('parent.children.authenticate', childProfile.id), {
            onError: () => reset('pin'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Enter PIN
                </h2>
            }
        >
            <Head title={`Enter PIN — ${childProfile.name}`} />

            <div className="mx-auto max-w-sm px-4 py-16 text-center">
                <div className="text-6xl">{childProfile.avatar ?? '🧒'}</div>
                <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Hi, {childProfile.name}!
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Enter your 4-digit PIN to start playing.
                </p>

                <form onSubmit={submit} className="mt-6">
                    <TextInput
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        autoFocus
                        className="block w-full text-center text-2xl tracking-[1em]"
                        value={data.pin}
                        onChange={(e) => setData('pin', e.target.value)}
                    />
                    <InputError message={errors.pin} className="mt-2" />

                    <PrimaryButton
                        className="mt-6 w-full justify-center"
                        disabled={processing}
                    >
                        Let's Go!
                    </PrimaryButton>
                </form>

                <Link
                    href={route('parent.dashboard')}
                    className="mt-6 inline-block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                    &larr; Back to profiles
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}
