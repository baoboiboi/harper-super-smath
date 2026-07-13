import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

const subjects = [
    { emoji: '🔢', title: 'Mathematics', description: 'From counting and number recognition through fractions, decimals, and word problems.' },
    { emoji: '⌨️', title: 'Typing', description: 'Letter recognition, home-row practice, and timed speed and accuracy challenges.' },
    { emoji: '🎨', title: 'Drawing & Creativity', description: 'A free-draw canvas alongside guided tracing and coloring activities.' },
    { emoji: '🎮', title: 'Educational Games', description: 'Math Adventure, Number Match, Memory Match, and more, all curriculum-aligned.' },
];

export default function Subjects() {
    return (
        <PublicLayout>
            <Head title="Subjects — Harper Super sMath!" />
            <section className="mx-auto max-w-4xl px-6 py-16">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Subjects
                </h1>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                    Every subject is broken into short, age-appropriate
                    activities. New lessons are added over time as the
                    curriculum grows.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    {subjects.map((subject) => (
                        <Card key={subject.title}>
                            <div className="text-3xl">{subject.emoji}</div>
                            <h2 className="mt-2 font-bold text-gray-900 dark:text-white">
                                {subject.title}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {subject.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
