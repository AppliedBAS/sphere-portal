import React from 'react';

export default function ProjectReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
}