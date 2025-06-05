"use client";

import {
  ArrowUpCircleIcon,
  FileBarChart2,
  Users,
  LayoutDashboard,
  TrendingUp,
  ClipboardCheck,
  FolderIcon,
  SettingsIcon,
  CreditCardIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import NavMain from "./NavMain";
import NavSecondary from "./NavSecondary";
import NavUser from "./NavUser";
import NavDocuments from "./NavDocuments";
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: TrendingUp, // Using ArrowUpCircleIcon as a better analytics icon
    },
    {
      title: "Projects",
      url: "dashboard/projects",
      icon: FolderIcon,
    },
    {
      title: "Clients",
      url: "dashboard/clients",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },

  ],
  documents: [
    {
      title: "Service Reports",
      url: "/dashboard/service-reports",
      icon: ClipboardCheck,
    },
    {
      title: "Project Reports",
      url: "/dashboard/project-reports",
      icon: FileBarChart2,
    },
    {
      title: "Purchase Orders",
      url: "/dashboard/purchase-orders",
      icon: CreditCardIcon,
    },
  ],
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Sphere Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
