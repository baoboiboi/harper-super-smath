import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <PublicLayout>
            <Head title="Privacy Policy — Harper Super sMath!" />
            <section className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Privacy Policy
                </h1>
                <Card className="mt-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Our full Privacy Policy, including how we handle
                        children's data under COPPA and other applicable
                        regulations, is being drafted with qualified privacy
                        and legal review before public launch. This page is a
                        placeholder; see the{' '}
                        <a href="/safety" className="text-sky-600 hover:underline">
                            Safety & Privacy
                        </a>{' '}
                        page for our current commitments.
                    </p>
                </Card>
            </section>
        </PublicLayout>
    );
}
