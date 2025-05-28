"use client";

import { firestore } from "@/lib/firebase";
import { ProjectReport } from "@/models/ProjectReport";
import {
  collection,
  DocumentReference,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ProjectReports() {
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const querySnapshot = await getDocs(
        collection(firestore, "project reports")
      );
      const data = querySnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            docId: doc.data().docId,
            createdAt: doc.data()["created-at"] as Timestamp,
            assignedTechniciansRef: doc.data()[
              "assigned-technicians-ref"
            ] as DocumentReference[],
          } as ProjectReport)
      );
      setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, []);

  if (loading) return <div>Loading...</div>;

  const drafts = reports.filter((r) => r.draft);
  const published = reports.filter((r) => !r.draft);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Project Reports</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Drafts</h2>
        {drafts.length === 0 ? (
          <div className="text-muted-foreground text-sm">No draft reports.</div>
        ) : (
          <ul className="space-y-4">
            {drafts.map((report) => (
              <li
                key={report.docId}
                className="border rounded p-4 bg-yellow-50"
              >
                <div className="font-semibold">{report.clientName}</div>
                <div className="text-sm text-muted-foreground">
                  {report.location}
                </div>
                <div className="text-xs">{report.description}</div>
                <div className="text-xs text-gray-400">
                  Created: {report.createdAt.toDate().toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Published</h2>
        {published.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No published reports.
          </div>
        ) : (
          <ul className="space-y-4">
            {published.map((report) => (
              <li key={report.docId} className="border rounded p-4">
                <div className="font-semibold">{report.clientName}</div>
                <div className="text-sm text-muted-foreground">
                  {report.location}
                </div>
                <div className="text-xs">{report.description}</div>
                <div className="text-xs text-gray-400">
                  Created: {report.createdAt.toDate().toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
