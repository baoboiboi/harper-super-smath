import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

export default function Contact() {
    return (
        <PublicLayout>
            <Head title="Contact — Harper Super sMath!" />
            <section className="mx-auto max-w-2xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Contact Us
                </h1>
                <Card className="mt-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        A contact form will be added here. In the meantime,
                        support requests are tracked internally, and this
                        page will be updated once a support channel is
                        finalized.
                    </p>
                </Card>
            </section>
        </PublicLayout>
    );
}
