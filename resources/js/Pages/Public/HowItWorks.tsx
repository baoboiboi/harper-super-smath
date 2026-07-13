import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

const steps = [
    { title: '1. Create a family account', description: 'Parents sign up with an email and verify it, no account needed for kids.' },
    { title: '2. Add a child profile', description: 'Pick an avatar, a grade level, and a simple 4-digit PIN.' },
    { title: '3. Learn and play', description: 'Your child picks a subject and works through short, encouraging activities.' },
    { title: '4. Review progress', description: 'Parents see clear reports on what was practiced and what needs more work.' },
];

export default function HowItWorks() {
    return (
        <PublicLayout>
            <Head title="How It Works — Harper Super sMath!" />
            <section className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    How It Works
                </h1>
                <div className="mt-8 space-y-4">
                    {steps.map((step) => (
                        <Card key={step.title}>
                            <h2 className="font-bold text-gray-900 dark:text-white">
                                {step.title}
                            </h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                {step.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
