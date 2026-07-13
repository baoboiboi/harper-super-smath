import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

const commitments = [
    'Children never need their own email address',
    'Every child profile is created and controlled by a verified parent or authorized school account',
    'No public child profiles or public artwork by default',
    'No unmoderated messaging between children',
    'No behavioral advertising and no sale of child data',
    'Parents can review and delete their child’s data at any time',
];

export default function Safety() {
    return (
        <PublicLayout>
            <Head title="Safety & Privacy — Harper Super sMath!" />
            <section className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Safety & Privacy
                </h1>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                    We designed this platform around privacy-by-design
                    principles for children. This page is a summary, not a
                    substitute for our full{' '}
                    <a href="#" className="text-sky-600 hover:underline">
                        Privacy Policy
                    </a>
                    , which is still being finalized with legal review before
                    public launch.
                </p>
                <Card className="mt-6">
                    <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                        {commitments.map((item) => (
                            <li key={item} className="flex gap-2">
                                <span className="text-sky-600">&#10003;</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </Card>
            </section>
        </PublicLayout>
    );
}
