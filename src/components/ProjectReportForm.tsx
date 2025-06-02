"use client";

import { useAuth } from "@/contexts/AuthContext";
import Form from "next/form"
import { useState } from "react";
import EmployeeSelect from "./EmployeeSelect";
import { Employee as EmployeeModel } from "@/models/Employee";
import { ProjectHit } from "@/models/ProjectHit";
import ProjectSelect from "./ProjectSelect";


export default function ProjectReportForm() {
  const { user } = useAuth();

  const [ selectedLeadEmployee, setSelectedLeadEmployee ] = useState<EmployeeModel | null>(null);
  const [ selectedProject, setSelectedProject ] = useState<ProjectHit | null>(null);
  const [ projectSelectLoading, setProjectSelectLoading ] = useState<boolean>(false);
  
  const [ loading, setLoading ] = useState<boolean>(false);
  
  return (
    <Form action="https://api.appliedbas.com/v1/pdf/pr">
      <ProjectSelect
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />

      <EmployeeSelect 
        selectedEmployee={selectedLeadEmployee}
        setSelectedEmployee={setSelectedLeadEmployee}
        placeholder="Select Lead Employee..."
      />

      <div className="mt-4">
        <label htmlFor="notes" className="text-muted-foreground text-sm">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          className="block w-full border rounded px-2 py-1 mt-1 mb-4"
          placeholder="Enter notes here"
        />

        <label htmlFor="additionalMaterials" className="text-muted-foreground text-sm">Additional Materials</label>
        <textarea
          id="additionalMaterials"
          name="additionalMaterials"
          rows={2}
          className="block w-full border rounded px-2 py-1 mt-1"
          placeholder="List additional materials"
        />
      </div>
    </Form>
  )
}