import ServiceReportForm from "@/components/ServiceReportForm";
import React from "react";

const CreateServiceReport: React.FC = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Create Service Report</h1>
      </header>
      <ServiceReportForm />
    </div>
  );
};

export default CreateServiceReport;
