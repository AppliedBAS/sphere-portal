import React from 'react';

export default function ServiceReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen px-8">
            <main>{children}</main>
        </div>
    );
}