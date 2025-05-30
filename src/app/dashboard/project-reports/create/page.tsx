import ProjectReportForm from "@/components/ProjectReportForm";
import React from "react";

const CreateProjectReportPage: React.FC = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Create Project Report</h1>
      </header>
      <ProjectReportForm />
    </div>
  );
};

export default CreateProjectReportPage;
