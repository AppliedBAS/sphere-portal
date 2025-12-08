"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import LogoDark from "../../../public/logo-dark.png";
import LogoLight from "../../../public/logo-light.png";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, loading, login } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
      return;
    }
  }, [router, user]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted-foreground text-lg">Loading…</span>
      </div>
    );
  if (user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted-foreground text-lg">Redirecting…</span>
      </div>
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleTheme}>
          <SunMoonIcon className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-lg px-8 py-10 flex flex-col items-center w-full max-w-sm">
        <div className="mb-12 flex flex-col items-center">
          {theme === "dark" ? (
            <Image src={LogoDark} alt="Sphere Portal Logo" className="mb-2" height={56} />
          ) : (
            <Image src={LogoLight} alt="Sphere Portal Logo" className="mb-2" height={56} />
          )}
          <h1 className="text-2xl font-bold mb-1 mt-2">Sign in to Sphere Portal</h1>
          <p className="text-muted-foreground text-sm">Access your dashboard and reports</p>
        </div>
        <Button
          onClick={login}
          className="flex items-center justify-center gap-2 text-base shadow font-semibold w-full py-3 bg-foreground text-white dark:text-black dark:hover:bg-gray-300 hover:bg-[#303030]"
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
    </div>
  );
}
