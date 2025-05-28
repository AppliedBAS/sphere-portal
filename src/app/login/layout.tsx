import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Sphere Portal",
  description: "Login to access the Sphere Portal dashboard and features.",
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-8">
      {children}
      </main>
    </div>
  );
};

export default Layout;
