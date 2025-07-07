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
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
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
    setPersistence(auth, browserLocalPersistence)
      .catch((err) => {
        console.warn("Local persistence failed, falling back to session:", err);
        return setPersistence(auth, browserSessionPersistence);
      })
      .catch((err) => {
        console.warn("Session persistence failed, using in-memory:", err);
        return setPersistence(auth, inMemoryPersistence);
      });
  }, []); // run once

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);

      if (fbUser?.email) {
        console.log("User authenticated:", fbUser.email);
        getEmployeeByEmail(fbUser.email)
          .then(setFirebaseUser)
          .catch((error) => {
            console.error("Error fetching employee data:", error);
            setFirebaseUser(null);
          }).finally(() => {
            setLoading(false);
          });
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
    
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = OAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        console.log("User signed in:", user.email);
        // Optionally, you can redirect to a specific page after login
        router.replace("/dashboard");
      })
      .catch(async (error) => {
        if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
          await signInWithRedirect(auth, provider);
        } else {
          console.error("Login failed:", error);
        }
        setUser(null);
        setFirebaseUser(null);
        setLoading(false);
        router.replace("/login");
      });
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
