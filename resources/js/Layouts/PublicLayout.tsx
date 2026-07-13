import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const navLinks = [
    { href: 'about', label: 'About' },
    { href: 'how-it-works', label: 'How It Works' },
    { href: 'subjects', label: 'Subjects' },
    { href: 'pricing', label: 'Pricing' },
];

const footerLinks = [
    { href: 'safety', label: 'Safety & Privacy' },
    { href: 'faq', label: 'FAQ' },
    { href: 'contact', label: 'Contact' },
    { href: 'terms', label: 'Terms' },
    { href: 'privacy', label: 'Privacy Policy' },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props as unknown as {
        auth: { user: unknown | null };
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link
                    href={route('home')}
                    className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100"
                >
                    <ApplicationLogo className="h-8 w-auto fill-current text-sky-600" />
                    Harper Super sMath!
                </Link>

                <div className="hidden items-center gap-6 sm:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={route(link.href)}
                            className="text-sm font-medium text-gray-600 hover:text-sky-600 dark:text-gray-300 dark:hover:text-sky-400"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-sm font-medium text-gray-600 hover:text-sky-600 dark:text-gray-300"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main>{children}</main>

            <footer className="mx-auto mt-20 max-w-6xl border-t border-gray-100 px-6 py-8 dark:border-gray-800">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={route(link.href)}
                            className="hover:text-sky-600 dark:hover:text-sky-400"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <p className="mt-4 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Harper Super sMath!
                </p>
            </footer>
        </div>
    );
}
