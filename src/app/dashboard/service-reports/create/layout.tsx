import React, { ReactNode } from 'react';

interface CreateServiceReportLayoutProps {
    children: ReactNode;
}

const CreateProjectReportLayout: React.FC<CreateServiceReportLayoutProps> = ({ children }) => {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
};

export default CreateProjectReportLayout;