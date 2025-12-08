"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { ProjectReport, projectReportConverter } from "@/models/ProjectReport";
import { Project, ProjectHit, projectConverter } from "@/models/Project";
import { Employee as EmployeeModel, employeeConverter } from "@/models/Employee";
import { Timestamp } from "firebase/firestore";
import ProjectReportForm from "@/components/ProjectReportForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import EditPageSkeleton from "@/components/EditPageSkeleton";
import { useAuth } from "@/contexts/AuthContext";

const EditProjectReportPage = () => {
  const { id } = useParams();
  const { user, firebaseUser } = useAuth();
  const [projectReport, setProjectReport] = useState<ProjectReport | null>(
    null
  );
  const [project, setProject] = useState<ProjectHit | null>(null);
  const [authorTechnician, setAuthorTechnician] = useState<EmployeeModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      setLoading(true);
      
      // Fetch project report
      const ref = doc(firestore, "project reports", id as string).withConverter(
        projectReportConverter
      );
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      
      const report = snap.data();
      setProjectReport(report);

      // Fetch project data
      if (report.projectDocId) {
        const projQ = query(
          collection(firestore, "projects").withConverter(projectConverter),
          where("doc-id", "==", report.projectDocId)
        );
        const projSnap = await getDocs(projQ);
        if (!projSnap.empty) {
          const docSnap = projSnap.docs[0];
          const data = docSnap.data() as Project;
          setProject({
            objectID: docSnap.id,
            docId: data.docId,
            client: data.client,
            description: data.description,
            location: data.location,
            active: data.active ?? true,
            balance: data.balance ?? 0,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          });
        }
      }

      // Fetch author technician
      if (report.authorTechnicianRef) {
        const empSnap = await getDoc(
          report.authorTechnicianRef.withConverter(employeeConverter)
        );
        if (empSnap.exists()) {
          const emp = empSnap.data() as EmployeeModel;
          setAuthorTechnician({
            ...emp,
            id: empSnap.id,
          });
        }
      } else if (firebaseUser) {
        // Fallback to current user if no author technician ref
        setAuthorTechnician(firebaseUser);
      }

      setLoading(false);
    }
    fetchReport();
  }, [id, firebaseUser]);

  if (loading) {
    return <EditPageSkeleton titleWidth="md" />;
  }
  if (!projectReport) return <div>Project Report not found.</div>;
  if (!user || !authorTechnician || !project) {
    return <EditPageSkeleton titleWidth="md" />;
  }

  return (
    <div className="flex flex-col space-y-6 pb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/project-reports">Project Reports</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/project-reports/${id}`}>{id}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold">Edit Project Report</h1>
      <ProjectReportForm 
        projectReport={projectReport} 
        project={project}
        authorTechnician={authorTechnician}
      />
    </div>
  );
};

export default EditProjectReportPage;
