import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

export default function Terms() {
    return (
        <PublicLayout>
            <Head title="Terms — Harper Super sMath!" />
            <section className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Terms of Service
                </h1>
                <Card className="mt-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Full Terms of Service are being drafted and will
                        require legal review before this platform launches
                        publicly. This page is a placeholder.
                    </p>
                </Card>
            </section>
        </PublicLayout>
    );
}
