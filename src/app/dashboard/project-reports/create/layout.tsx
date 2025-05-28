import React, { ReactNode } from 'react';

interface CreateProjectReportLayoutProps {
    children: ReactNode;
}

const CreateProjectReportLayout: React.FC<CreateProjectReportLayoutProps> = ({ children }) => {
    return (
        <div className="">
            <header className="mb-6">
                <h1 className="text-2xl font-bold">Create Project Report</h1>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default CreateProjectReportLayout;