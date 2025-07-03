"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  OAuthProvider,
  signOut,
  User,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { Employee } from "@/models/Employee";
import { getEmployeeByEmail } from "@/services/employeeService";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  firebaseUser: Employee | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  firebaseUser: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      console.log("Auth state changed:", fbUser);
      setUser(fbUser);

      if (fbUser?.email) {
        getEmployeeByEmail(fbUser.email)
          .then(setFirebaseUser)
          .catch((error) => {
            console.error("Error fetching employee data:", error);
            setFirebaseUser(null);
          })
      } else {
        setFirebaseUser(null);
        router.replace("/login");
      }

      setLoading(false);
    });
    return () => unsubscribe();
    
  }, [router]);

  const login = async () => {
    const provider = new OAuthProvider("microsoft.com");

    provider.setCustomParameters({
      prompt: "consent",
      tenant: 'ad969dc0-5f48-4d4a-89bc-c5b5532c5d6b'
    });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error", err);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, firebaseUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => useContext(AuthContext);
