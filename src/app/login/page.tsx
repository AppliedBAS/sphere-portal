"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRedirectResult, OAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, loading, login } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
      return;
    }
    
    getRedirectResult(auth)
      .then(result => {
        if (!result) return; // No result means no redirect sign-in attempted
        // Signed in
        const user = result.user;
        console.log('Signed in via redirect as', user.email);
        const credential = OAuthProvider.credentialFromResult(result);
        console.log('Access Token:', credential?.accessToken);
      })
      .catch(error => {
        console.error('Redirect sign-in error:', error);
      });
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (loading) return <p>Loading…</p>;
  if (user) return <p>Redirecting…</p>;

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleTheme}>
          <SunMoonIcon className="h-5 w-5" />
          <span>Toggle Theme</span>
        </div>
      </div>
      <Button
        onClick={login}
        className="flex items-center justify-center gap-2 text-sm shadow transition-colors font-semibold cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
          <rect x="1" y="1" width="9" height="9" fill="#F35325" />
          <rect x="13" y="1" width="9" height="9" fill="#81BC06" />
          <rect x="1" y="13" width="9" height="9" fill="#05A6F0" />
          <rect x="13" y="13" width="9" height="9" fill="#FFBA08" />
        </svg>
        Sign in with Microsoft
      </Button>
    </div>
  );
}
