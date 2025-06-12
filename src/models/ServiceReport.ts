import { DocumentReference, Timestamp } from "firebase/firestore";


export interface ServiceReport {
    id: string;
    authorTechnicianRef: DocumentReference;
    cityStateZip: string;
    clientName: string;
    contactEmail: string;
    contactPhone: string;
    contactName: string;
    createdAt: Timestamp;
    docId: number;
    dateSigned?: Timestamp;
    draft: boolean;
    materialNotes: string;
    printedName: string;
    serviceAddress1: string;
    serviceAddress2: string;
    serviceNotes: ServiceNote[];
}

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