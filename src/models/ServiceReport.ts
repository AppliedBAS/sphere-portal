import { DocumentData, DocumentReference, DocumentSnapshot, FirestoreDataConverter, Timestamp } from "firebase/firestore";


export interface ServiceReport {
    id: string;
    authorTechnicianRef: DocumentReference;
    assignedTechnicianRef: DocumentReference | null;
    cityStateZip: string;
    clientName: string;
    contactEmail: string;
    contactPhone: string;
    contactName: string;
    createdAt: Timestamp;
    docId: number;
    dateSigned: Timestamp | null;
    draft: boolean;
    materialNotes: string;
    printedName: string;
    serviceAddress1: string;
    serviceAddress2: string | null;
    serviceNotes: ServiceNote[];
}

export const serviceReportConverter: FirestoreDataConverter<ServiceReport> = {
  toFirestore(report: ServiceReport) {
    return {
      "author-technician-ref": report.authorTechnicianRef,
      "assigned-technician-ref": report.assignedTechnicianRef,
      "city-state-zip": report.cityStateZip,
      "client-name": report.clientName,
      "contact-email": report.contactEmail,
      "contact-phone": report.contactPhone,
      "contact-name": report.contactName,
      "created-at": report.createdAt,
      "doc-id": report.docId,
      "date-signed": report.dateSigned,
      draft: report.draft,
      "material-notes": report.materialNotes,
      "printed-name": report.printedName,
      "service-address1": report.serviceAddress1,
      "service-address2": report.serviceAddress2,
      "service-notes": report.serviceNotes.map((note) => ({
            date: note.date,
            "helper-overtime": note.helperOvertime,
            "helper-time": note.helperTime,
            "remote-work": note.remoteWork,
            "service-notes": note.serviceNotes,
            "technician-overtime": note.technicianOvertime,
            "technician-time": note.technicianTime,
          }))
    };
  },
  fromFirestore(
    snapshot: DocumentSnapshot
  ): ServiceReport {
    const data = snapshot.data()!;
    return {
      id: snapshot.id,
      authorTechnicianRef: data["author-technician-ref"],
      assignedTechnicianRef: data["assigned-technician-ref"],
      cityStateZip: data["city-state-zip"],
      clientName: data["client-name"],
      contactEmail: data["contact-email"],
      contactPhone: data["contact-phone"],
      contactName: data["contact-name"],
      createdAt: data["created-at"],
      docId: data["doc-id"],
      dateSigned: data["date-signed"],
      draft: data.draft,
      materialNotes: data["material-notes"],
      printedName: data["printed-name"],
      serviceAddress1: data["service-address1"],
      serviceAddress2: data["service-address2"],
      serviceNotes: data["service-notes"].map((note: DocumentData) => ({
        date: note.date,
        helperOvertime: note["helper-overtime"],
        helperTime: note["helper-time"],
        remoteWork: note["remote-work"],
        serviceNotes: note["service-notes"],
        technicianOvertime: note["technician-overtime"],
        technicianTime: note["technician-time"],
      })),
    };
  },
};

export interface ServiceNote {
    date: Timestamp;
    helperOvertime: string;
    helperTime: string;
    remoteWork: string;
    serviceNotes: string;
    technicianOvertime: string;
    technicianTime: string;
}

export interface ServiceReportMessage {
  report_no: number;
  date: string;              // e.g. "2025-06-05"
  client_name: string;
  service_address: string;
  city_state_zip: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  signature?: string | null;
  t_time: number;            // total technician hours (e.g. 3.5)
  t_ot: number;              // technician overtime hours (e.g. 1.0)
  h_time: number;            // helper hours (e.g. 2.0)
  h_ot: number;              // helper overtime hours (e.g. 0.5)
  materials: string;         // e.g. "Copper tubing, valves"
  notes: Array<{
    date: string;            // format "YYYY-MM-DD"
    technician_time: number; // e.g. 3.5
    technician_overtime: number;
    helper_time: number;
    helper_overtime: number;
    remote_work: string;     // e.g. "Remote diagnostics only"
    notes: string;           // free‐form text about that day’s work
  }>;
  technician_name: string;
  technician_phone: string;
  technician_email: string;
  print_name?: string | null;
  sign_date?: string | null;  // e.g. "2025-06-05"
  to_emails: string[];        // list of all recipients’ emails
  start_date: string;         // e.g. "2025-06-03"
  end_date: string;           // e.g. "2025-06-05"
}