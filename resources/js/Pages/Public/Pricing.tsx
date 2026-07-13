import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Link, Head } from '@inertiajs/react';

const plans = [
    { name: 'Free', price: '$0', description: 'One child profile, full access to Mathematics.' },
    { name: 'Family', price: 'Coming soon', description: 'Multiple children, every subject, progress reports.' },
    { name: 'Teacher', price: 'Coming soon', description: 'A classroom of students, assignments, and reporting.' },
    { name: 'School', price: 'Coming soon', description: 'School-wide licensing and administration.' },
];

export default function Pricing() {
    return (
        <PublicLayout>
            <Head title="Pricing — Harper Super sMath!" />
            <section className="mx-auto max-w-5xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Pricing
                </h1>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                    Paid plans are still being finalized. You can create a
                    free account today.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan) => (
                        <Card key={plan.name} className="text-center">
                            <h2 className="font-bold text-gray-900 dark:text-white">
                                {plan.name}
                            </h2>
                            <p className="mt-2 text-2xl font-extrabold text-sky-600">
                                {plan.price}
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                {plan.description}
                            </p>
                        </Card>
                    ))}
                </div>
                <div className="mt-10 text-center">
                    <Link
                        href={route('register')}
                        className="rounded-full bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
                    >
                        Start for Free
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
