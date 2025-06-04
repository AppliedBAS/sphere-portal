"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Employee } from "@/models/Employee";

interface UseEmployeesResult {
  employees: Employee[];
  technicians: Employee[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);

    try {
      const employeesRef = collection(firestore, "employees");
      const activeQuery = query(employeesRef, where("active", "==", true));

      const snapshot = await getDocs(activeQuery);
      const list: Employee[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          active: data.active ?? true,
          clientId: data.clientId ?? "",
          clientSecret: data.clientSecret ?? "",
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
          policy: data.policy ?? [],
          role: data.role ?? null,
        };
      });
      setEmployees(list);
      // Optionally filter technicians if needed
      const techList = list.filter((emp) => emp.role === "technician");
      setTechnicians(techList);

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch once when hook is mounted
    fetchEmployees();
  }, []);

  return { employees, technicians, loading, error, refetch: fetchEmployees };
}
