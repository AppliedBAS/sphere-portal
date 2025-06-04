"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, FormEvent } from "react";
import EmployeeSelect from "./EmployeeSelect";
import { Employee as EmployeeModel } from "@/models/Employee";
import ProjectSelect from "./ProjectSelect";
import { Button } from "./ui/button";
import { useEmployees } from "@/hooks/useEmployees";
import {
  getEmployeeByEmail,
  getProjectById,
  sendProjectReportEmail,
} from "@/lib/services";
import { ProjectReport, ProjectReportMessage } from "@/models/ProjectReport";
import { toast } from "sonner";
import { Project, ProjectHit } from "@/models/Project";
import { getDoc } from "firebase/firestore";

interface ProjectReportFormProps {
  projectReport?: ProjectReport;
}

export default function ProjectReportForm({ projectReport }: ProjectReportFormProps) {
  const { user } = useAuth();

  const {
    technicians,
    loading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [leadEmployee, setLeadEmployee] = useState<EmployeeModel | null>(null);
  const [project, setProject] = useState<ProjectHit | null>(null);
  const [assignedTechnicians, setAssignedTechnicians] = useState<EmployeeModel[]>([]);

  // Controlled state for the two textareas:
  const [notes, setNotes] = useState<string>(projectReport?.notes || "");
  const [additionalMaterials, setAdditionalMaterials] = useState<string>(
    projectReport?.materials || ""
  );

  // If editing an existing report, load its values into state:
  useEffect(() => {
    async function initForm() {
      if (!projectReport) return;

      const firestoreProject: Project = await getProjectById(
        projectReport.projectDocId
      );
      const projectHit: ProjectHit = {
        objectID: firestoreProject.id,
        docId: firestoreProject.docId,
        client: firestoreProject.client,
        description: firestoreProject.description,
        location: firestoreProject.location,
      };
      setProject(projectHit);

      if (projectReport.leadTechnicianRef) {
        const employeeSnap = await getDoc(projectReport.leadTechnicianRef);
        const employeeData = employeeSnap.data();
        if (employeeData) {
          setLeadEmployee({
            id: employeeSnap.id,
            clientId: employeeData["client-id"],
            clientSecret: employeeData["client-secret"],
            createdAt: employeeData["created-at"],
            updatedAt: employeeData["updated-at"],
            ...employeeData,
          } as EmployeeModel);
        }
      }

      if (projectReport.assignedTechniciansRef) {
        const assignedEmps: EmployeeModel[] = [];
        for (const ref of projectReport.assignedTechniciansRef) {
          const empDoc = await getDoc(ref);
          if (empDoc.exists()) {
            const d = empDoc.data();
            assignedEmps.push({
              id: empDoc.id,
              clientId: d["client-id"],
              clientSecret: d["client-secret"],
              createdAt: d["created-at"],
              updatedAt: d["updated-at"],
              ...d,
            } as EmployeeModel);
          }
        }
        setAssignedTechnicians(assignedEmps);
      }

      // Pre-fill controlled inputs if editing:
      setNotes(projectReport.notes || "");
      setAdditionalMaterials(projectReport.materials || "");
    }

    initForm();
  }, [projectReport]);

  const handleAddTechnician = (emp: EmployeeModel) => {
    if (!assignedTechnicians.some((existing) => existing.id === emp.id)) {
      setAssignedTechnicians((prev) => [...prev, emp]);
    }
  };

  const handleRemoveTechnician = (empId: string) => {
    setAssignedTechnicians((prev) => prev.filter((e) => e.id !== empId));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!project) {
        throw new Error("Project is required");
      }

      let employee: EmployeeModel;
      if (leadEmployee) {
        employee = leadEmployee;
      } else {
        employee = await getEmployeeByEmail(user!.email!);
      }

      const projectReportMessage: ProjectReportMessage = {
        technician_name: employee.name,
        technician_phone: employee.phone,
        technician_email: employee.email,
        location: project.location,
        description: project.description,
        project_id: project.docId,
        doc_id: 1, // Assuming doc_id is always 1 for the first report
        project_subtitle: `PR ${project.docId} - 1 - ${project.location} - ${project.description}`,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        client_name: project.client,
        materials: additionalMaterials || "None",
        notes: notes || "None",
      };

      const response: Response = await sendProjectReportEmail(
        projectReportMessage,
        employee
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email: ${errorText}`);
      }

      toast.success("Report submitted successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(`${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-4 flex flex-col gap-2">
        <label htmlFor="projectId" className="text-sm">
          Project
        </label>
        <ProjectSelect
          selectedProject={project}
          setSelectedProject={setProject}
        />

        <label htmlFor="leadTechnician" className="text-sm">
          Lead Technician
        </label>
        <EmployeeSelect
          employees={technicians}
          loading={loadingEmployees}
          error={employeesError}
          refetch={refetchEmployees}
          selectedEmployee={leadEmployee}
          setSelectedEmployee={setLeadEmployee}
          placeholder="Select Lead Technician..."
        />
        <p className="text-sm text-gray-500 mb-1">
          Leave blank if you are the lead technician.
        </p>

        <label htmlFor="assignedTechnicians" className="text-sm">
          Assigned Technicians
        </label>
        <div className="flex flex-wrap gap-2">
          {assignedTechnicians.map((emp) => (
            <span
              key={emp.id}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {emp.name}
              <button
                type="button"
                onClick={() => handleRemoveTechnician(emp.id)}
                className="ml-1 text-blue-500 hover:text-blue-800"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <EmployeeSelect
          employees={technicians}
          loading={loadingEmployees}
          error={employeesError}
          refetch={refetchEmployees}
          selectedEmployee={null}
          setSelectedEmployee={(empl) => {
            handleAddTechnician(empl as EmployeeModel);
          }}
          placeholder="Add Technician..."
        />

        <label htmlFor="notes" className="text-sm">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="block w-full border rounded px-2 py-1 text-sm"
          placeholder="Enter notes here"
        />

        <label htmlFor="additionalMaterials" className="text-sm">
          Additional Materials
        </label>
        <textarea
          id="additionalMaterials"
          name="additionalMaterials"
          value={additionalMaterials}
          onChange={(e) => setAdditionalMaterials(e.target.value)}
          rows={2}
          className="block w-full border rounded px-2 py-1 mt-1 text-sm"
          placeholder="Optional materials used"
        />

        <Button
          type="submit"
          disabled={submitting || loadingEmployees || !project}
          variant="default"
          className="mt-4 md:max-w-52 w-full"
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
