import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

const faqs = [
    { q: 'Does my child need their own email address?', a: 'No. Children use a profile and a simple PIN under your parent account.' },
    { q: 'Can I control how long my child uses the app?', a: 'Yes, daily usage limits and allowed subjects are managed from your parent dashboard.' },
    { q: 'Is my child’s artwork or progress public?', a: 'No, nothing is public by default. Only you can see your child’s activity.' },
    { q: 'Can I remove a child profile?', a: 'Yes, at any time from your parent dashboard.' },
];

export default function Faq() {
    return (
        <PublicLayout>
            <Head title="FAQ — Harper Super sMath!" />
            <section className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Frequently Asked Questions
                </h1>
                <div className="mt-8 space-y-4">
                    {faqs.map((faq) => (
                        <Card key={faq.q}>
                            <h2 className="font-bold text-gray-900 dark:text-white">
                                {faq.q}
                            </h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                {faq.a}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
