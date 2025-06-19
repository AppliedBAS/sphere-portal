"use client";
import * as React from "react";
import { LucideIcon, SunMoonIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

interface Item {
  title: string;
  url: string;
  icon: LucideIcon;
}

export default function NavSecondary({ items }: { items: Item[] }) {
  const { theme, setTheme } = useTheme();
  // const { isMobile, setOpenMobile } = useSidebar();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center space-x-2">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2 cursor-pointer space-x-2" onClick={toggleTheme}>
                <SunMoonIcon className="h-5 w-5" />
                <span>Toggle Theme</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
