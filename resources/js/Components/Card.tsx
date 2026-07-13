import { HTMLAttributes } from 'react';

export default function Card({
    className = '',
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800 ${className}`}
        >
            {children}
        </div>
    );
}
