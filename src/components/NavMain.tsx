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
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-10 bg-primary text-base text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground space-x-2"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
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
                  <DropdownMenuItem asChild onClick={() => setOpenMobile(false)}>
                    <Link href="/dashboard/service-reports/create" className="flex items-center w-full">
                      <ClipboardCheck className="mr-4"  />
                      <span>Service Reports</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild onClick={() => setOpenMobile(false)}>
                    <Link href="/dashboard/project-reports/create" className="flex items-center w-full">
                      <FileBarChart2 className="mr-4" />
                      <span>Project Reports</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild onClick={() => setOpenMobile(false)}>
                    <Link href="/dashboard/purchase-orders/create" className="flex items-center w-full">
                      <CreditCardIcon className="mr-4" />
                      <span>Purchase Orders</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className="text-base md:text-sm" tooltip={item.title} asChild onClick={() => setOpenMobile(false)}>
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
