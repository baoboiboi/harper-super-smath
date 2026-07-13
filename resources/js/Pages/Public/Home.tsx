import Card from '@/Components/Card';
import PublicLayout from '@/Layouts/PublicLayout';
import { Link, Head } from '@inertiajs/react';

const categories = [
    { emoji: '🔢', title: 'Mathematics', description: 'Counting, addition, fractions, and more, one short activity at a time.' },
    { emoji: '⌨️', title: 'Typing', description: 'Home-row practice through to full sentences, with speed and accuracy tracking.' },
    { emoji: '🎨', title: 'Drawing & Creativity', description: 'A private canvas, guided tracing, and coloring pages.' },
    { emoji: '🎮', title: 'Educational Games', description: 'Short, focused games that reinforce what your child is learning.' },
];

const childBenefits = [
    'Big, friendly buttons made for small hands',
    'Encouraging feedback instead of red X marks',
    'Short sessions that fit a child’s attention span',
];

const parentBenefits = [
    'Clear progress reports, not just a percentage bar',
    'Control over daily time limits and allowed subjects',
    'A private, ad-free space for your child',
];

const teacherBenefits = [
    'Assign lessons and games to a whole classroom',
    'See which students need extra support at a glance',
    'Build custom question sets for your curriculum',
];

export default function Home() {
    return (
        <PublicLayout>
            <Head title="Harper Super sMath! — Learning Playground for Kids" />

            <section className="mx-auto max-w-4xl px-6 py-20 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl dark:text-white">
                    A learning playground your child will actually ask for.
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                    Math, typing, drawing, and games in one safe, colorful
                    place, built for kids and trusted by parents and
                    teachers.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        href={route('register')}
                        className="rounded-full bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
                    >
                        Start for Free
                    </Link>
                    <Link
                        href={route('how-it-works')}
                        className="rounded-full bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                    >
                        See How It Works
                    </Link>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => (
                        <Card key={category.title} className="text-center">
                            <div className="text-4xl">{category.emoji}</div>
                            <h3 className="mt-3 font-bold text-gray-900 dark:text-white">
                                {category.title}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {category.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="grid gap-8 sm:grid-cols-3">
                    <BenefitList title="For Kids" items={childBenefits} />
                    <BenefitList title="For Parents" items={parentBenefits} />
                    <BenefitList title="For Teachers" items={teacherBenefits} />
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-6 py-16 text-center">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Built with safety first
                    </h2>
                    <p className="mt-3 text-gray-600 dark:text-gray-300">
                        No public profiles, no ads, no unmoderated messaging.
                        Every child profile is created and controlled by a
                        parent or an authorized school account.{' '}
                        <Link
                            href={route('safety')}
                            className="font-semibold text-sky-600 hover:underline"
                        >
                            Read our safety commitments
                        </Link>
                        .
                    </p>
                </Card>
            </section>

            <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ready to get started?
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Free to try, no credit card required.
                </p>
                <div className="mt-6">
                    <Link
                        href={route('register')}
                        className="rounded-full bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
                    >
                        Create Your Family Account
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}

function BenefitList({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
                {title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {items.map((item) => (
                    <li key={item} className="flex gap-2">
                        <span className="text-sky-600">&#10003;</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
