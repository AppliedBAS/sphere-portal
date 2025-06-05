import { collection, DocumentData, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Employee } from "@/models/Employee";
import { ProjectReportMessage } from "@/models/ProjectReport";
import { Project } from "@/models/Project";
import { ServiceReportMessage } from "@/models/ServiceReport";

/**
 * Fetches employee data by email.
 */
export async function getEmployeeByEmail(email: string): Promise<Employee> {
  const usersRef = collection(firestore, "employees");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Employee record not found");
  }

  const data = snapshot.docs[0].data();
  return {
    id: snapshot.docs[0].id,
    clientId: data["client-id"],
    clientSecret: data["client-secret"],
    createdAt: data["created-at"],
    updatedAt: data["updated-at"],
    ...data,
  } as Employee;
}

export async function getProjectById(docId: number): Promise<Project> {
  const projectsRef = collection(firestore, "projects");
  const q = query(projectsRef, where("doc-id", "==", docId))
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Project not found");
  }

  const data: DocumentData = snapshot.docs[0].data();
  return {
    id: snapshot.docs[0].id,
    docId: data["doc-id"],
    createdAt: data["created-at"],
    updatedAt: data["updated-at"],
    parentRef: data["parent-ref"],
    ...data,
  } as Project;
}

export async function sendProjectReportEmail(message: ProjectReportMessage, employee: Employee): Promise<Response>{
  const token = btoa(`${employee.clientId}:${employee.clientSecret}`);

  return await fetch("https://api.appliedbas.com/v2/mail/pr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

export async function sendServiceReportEmail(
  message: ServiceReportMessage,
  employee: Employee
): Promise<Response> {
  // build a Basic‐Auth–style token from the employee’s clientId/clientSecret
  const token = btoa(`${employee.clientId}:${employee.clientSecret}`);

  return await fetch("https://api.appliedbas.com/v2/mail/sr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}
