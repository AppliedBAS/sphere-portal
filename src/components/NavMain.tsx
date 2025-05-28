import {
  ClipboardCheck,
  CreditCardIcon,
  FileBarChart2,
  LucideIcon,
  PlusIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface Item {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export default function NavMain({ items }: { items: Item[] }) {
  const { isMobile } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <PlusIcon />
                  <span>Quick Create</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <a href="/dashboard/service-reports/create" className="flex items-center w-full">
                      <ClipboardCheck className="mr-4" />
                      <span>Service Reports</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/dashboard/project-reports/create" className="flex items-center w-full">
                      <FileBarChart2 className="mr-4" />
                      <span>Project Reports</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/dashboard/purchase-orders/create" className="flex items-center w-full">
                      <CreditCardIcon className="mr-4" />
                      <span>Purchase Orders</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link href={item.url}>
                  {item.icon && <item.icon className="mr-2" />}
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
