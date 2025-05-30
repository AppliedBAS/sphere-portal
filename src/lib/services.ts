import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { ProjectHit } from "@/models/ProjectHit";

/**
 * Fetches employee data by email.
 */
export async function getEmployeeByEmail(email: string) {
  const usersRef = collection(firestore, "employees");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Employee record not found");
  }

  const data = snapshot.docs[0].data();
  return {
    name: data.name as string,
    phone: data.phone as string,
    clientId: data["client-id"] as string,
    clientSecret: data["client-secret"] as string,
  };
}

interface GeneratePdfParams {
  project: ProjectHit;
  values: { notes?: string; materialNotes?: string };
  employee: { name: string; phone: string; clientId: string; clientSecret: string };
}

/**
 * Sends a request to generate a project report PDF.
 */
export async function generateProjectReportPdf({ project, values, employee }: GeneratePdfParams) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const subtitle = `PR ${project.docId} - 1 - ${project.location} - ${project.description}`;

  const payload = {
    project_no: project.docId,
    doc_id: 1,
    project_subtitle: subtitle,
    date,
    client_name: project.client,
    location: project.location,
    materials: values.materialNotes || "None",
    notes: values.notes || "",
    technician_name: employee.name,
    technician_phone: employee.phone,
  };

  const token = btoa(`${employee.clientId}:${employee.clientSecret}`);
  const res = await fetch("https://api.appliedbas.com/v1/pdf/pr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PDF API failed: ${text}`);
  }

  return res.json();
}
