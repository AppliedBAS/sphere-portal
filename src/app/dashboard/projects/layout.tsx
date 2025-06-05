import React from "react";

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen px-8">
            {children}
        </div>
    );
}