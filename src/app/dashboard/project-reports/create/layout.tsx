import React, { ReactNode } from 'react';

interface CreateProjectReportLayoutProps {
    children: ReactNode;
}

const CreateProjectReportLayout: React.FC<CreateProjectReportLayoutProps> = ({ children }) => {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
};

export default CreateProjectReportLayout;