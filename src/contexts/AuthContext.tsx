"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { Employee } from "@/models/Employee";
import { getEmployeeByEmail } from "@/services/employeeService";
import { FirebaseError } from "firebase/app";

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
  const initialCheckDone = useRef(false);

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
    // Check for redirect result on mount
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in via redirect
          setUser(result.user);
        }
      })
      .catch((error) => {
        const err = error as FirebaseError;
        // Only log non-cancellation errors
        if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
          console.error("Redirect result error:", err);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);

      if (fbUser?.email) {
        try {
          const employee = await getEmployeeByEmail(fbUser.email);
          setFirebaseUser(employee);
        } catch (error) {
          console.error("Error fetching employee data:", error);
          setFirebaseUser(null);
        } finally {
          setLoading(false);
          initialCheckDone.current = true;
        }
      } else {
        setFirebaseUser(null);
        setLoading(false);
        // Only redirect to login after initial check is complete and user is null
        // This prevents redirecting during the initial auth state restoration
        if (fbUser === null) {
          if (initialCheckDone.current) {
            // Check if we're not already on login page to avoid unnecessary redirects
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
              router.replace("/login");
            }
          } else {
            // Mark initial check as done even if user is null
            initialCheckDone.current = true;
          }
        }
      }
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
      router.replace("/dashboard");
    } catch (error) {
      const err = error as FirebaseError;
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Login failed:", err);
        
        // Check if it's the expired client secret error
        const errorMessage = err.message || "";
        if (errorMessage.includes("expired") || errorMessage.includes("AADSTS7000222") || err.code === "auth/invalid-credential") {
          alert("Authentication error: The Microsoft OAuth client secret has expired. Please contact your administrator to update it in Azure Portal and Firebase Console.\n\nTo fix this:\n1. Go to Azure Portal → App registrations\n2. Create a new client secret\n3. Update the secret in Firebase Console → Authentication → Sign-in method → Microsoft");
        }
      }
      setUser(null);
      setFirebaseUser(null);
      setLoading(false);
      router.replace("/login");
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
