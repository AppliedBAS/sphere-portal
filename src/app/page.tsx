"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
      <div>
        <div className="relative w-full h-1 overflow-hidden bg-gradient-to-r from-[#0070f3] via-[#0070f3] to-[#79ffe1] animate-loading-bar" />
        <style>
          {`
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .animate-loading-bar {
              animation: loading-bar 1.5s infinite linear;
            }
          `}
        </style>
        Loading...
      </div>
    );
}
