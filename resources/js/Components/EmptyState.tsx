import { PropsWithChildren, ReactNode } from 'react';

export default function EmptyState({
    icon,
    title,
    description,
    children,
}: PropsWithChildren<{
    icon?: ReactNode;
    title: string;
    description?: string;
}>) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center dark:border-gray-700">
            {icon && <div className="text-4xl">{icon}</div>}
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {title}
            </p>
            {description && (
                <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}
            {children && <div className="mt-2">{children}</div>}
        </div>
    );
}
