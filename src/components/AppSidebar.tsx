"use client";

import {
  ArrowUpCircleIcon,
  FileBarChart2,
  ShoppingCart,
  Users,
  LayoutDashboard,
  TrendingUp,
  ClipboardCheck,
  FolderIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import NavMain from "./NavMain";
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      title: "Analytics",
      url: "#",
      icon: TrendingUp, // Using ArrowUpCircleIcon as a better analytics icon
    },
    {
        title: "Projects",
        url: "#",
        icon: FolderIcon,
    },
    {
        title: "Clients",
        url: "#",
        icon: Users,
    }
  ],
  documents: [
    {
      title: "Service Reports",
      url: "#",
      icon: ClipboardCheck,
    },
    {
      title: "Project Reports",
      url: "#",
      icon: FileBarChart2,
    },
    {
      title: "Purchase Orders",
      url: "#",
      icon: ShoppingCart,
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
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.documents.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
