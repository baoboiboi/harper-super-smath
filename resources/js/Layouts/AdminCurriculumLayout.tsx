import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

const tabs = [
    { href: 'admin.curriculum.subjects.index', label: 'Subjects' },
    { href: 'admin.curriculum.grade-levels.index', label: 'Grade Levels' },
    { href: 'admin.curriculum.skills.index', label: 'Skills' },
    { href: 'admin.curriculum.courses.index', label: 'Courses' },
    { href: 'admin.curriculum.units.index', label: 'Units' },
    { href: 'admin.curriculum.lessons.index', label: 'Lessons' },
];

export default function AdminCurriculumLayout({
    header,
    children,
}: PropsWithChildren<{ header: ReactNode }>) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {header}
                </h2>
            }
        >
            <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
                <nav className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={route(tab.href)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                route().current(tab.href)
                                    ? 'bg-sky-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </div>
        </AuthenticatedLayout>
    );
}
