import { AppSidebar } from "@/components/AppSidebar";
// import NavBar from "@/components/NavBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Sphere Portal",
  description: "Access your dashboard, reports, and settings in the Sphere Portal.",
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 h-screen w-full">
        <SidebarTrigger className="p-4 m-2"/>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
