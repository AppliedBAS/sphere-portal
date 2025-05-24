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
  signInWithPopup,
  OAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setLoading(false);

      if (fbUser) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const login = async () => {
    const provider = new OAuthProvider("microsoft.com");

    provider.setCustomParameters({
      prompt: "consent",
      login_hint: "user@appliedbas.com",
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => useContext(AuthContext);
