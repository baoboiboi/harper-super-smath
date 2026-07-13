import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <PublicLayout>
            <Head title="About — Harper Super sMath!" />
            <section className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    About Harper Super sMath!
                </h1>
                <Card className="mt-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Harper Super sMath! started as a simple flashcard
                        game for one child, and is growing into a full
                        learning playground covering math, typing, drawing,
                        and educational games, built around positive
                        reinforcement instead of pressure.
                    </p>
                </Card>
            </section>
        </PublicLayout>
    );
}
