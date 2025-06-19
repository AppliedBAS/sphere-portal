import { LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "./ui/sidebar";
import Link from "next/link";

interface Item {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export default function NavDocuments({ items }: { items: Item[] }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}>
                    <Link href={item.url} className="flex items-center space-x-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
  );
}