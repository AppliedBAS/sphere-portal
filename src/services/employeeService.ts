import { firestore } from "@/lib/firebase";
import { Employee, employeeConverter } from "@/models/Employee";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function getEmployeeByEmail( email: string ): Promise<Employee> {
    // find employee by email in firebase
    const employeesCollectionRef = collection(firestore, "employees").withConverter(employeeConverter);
    const q = query(employeesCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        throw new Error("Employee record not found");
    }
    const employee = querySnapshot.docs[0].data();
    return employee;
}