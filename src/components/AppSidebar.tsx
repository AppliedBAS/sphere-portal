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
  useSidebar,
} from "./ui/sidebar";
import NavMain from "./NavMain";
import NavSecondary from "./NavSecondary";
import NavUser from "./NavUser";
import NavDocuments from "./NavDocuments";
import Link from "next/link";
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
      url: "/dashboard/projects",
      icon: FolderIcon,
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
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
  const { setOpenMobile, isMobile } = useSidebar();

  console.log(isMobile, "isMobile in AppSidebar");
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={() => {
                if(isMobile) setOpenMobile(false);
              }}
            >
              <Link href="/dashboard" className="flex items-center space-x-2">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Sphere Portal</span>
              </Link>
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
