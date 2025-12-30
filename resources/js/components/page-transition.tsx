import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

export default function PageTransition({
    children,
}: {
    children: ReactNode;
}) {
    const page = usePage();
    const pageKey = page.url;

    return (
        <div
            key={pageKey}
            className="flex flex-1 flex-col animate-appear motion-reduce:animate-none"
        >
            {children}
        </div>
    );
}
