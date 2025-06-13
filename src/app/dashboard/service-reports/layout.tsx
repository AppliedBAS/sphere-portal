import React from 'react';

export default function ServiceReportsLayout({
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