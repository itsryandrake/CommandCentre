import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Heart,
  Settings,
  Users,
  Flame,
  Sparkles,
  LayoutGrid,
  Target,
  Wallet,
  Contact,
  Wrench,
  Church,
  Home,
  TrendingUp,
  Landmark,
  Smile,
  Award,
  ShoppingCart,
  CheckSquare,
  Shirt,
  ScrollText,
  FileText,
  Castle,
  ListChecks,
  UtensilsCrossed,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { UserSelector } from "@/components/UserSelector";

const faithItems = [
  { title: "Goals", icon: Target, href: "/goals" },
  { title: "Life Script", icon: ScrollText, href: "/faith/life-script" },
  { title: "Vision Board", icon: LayoutGrid, href: "/sanctuary/vision-board" },
];

const familyItems = [
  { title: "The Sanctuary", icon: Flame, href: "/sanctuary" },
  { title: "Profiles", icon: Users, href: "/sanctuary/profiles" },
  { title: "Intimacy", icon: Sparkles, href: "/sanctuary/intimacy" },
  { title: "CRM", icon: Contact, href: "/family/crm" },
  { title: "Shopping List", icon: ShoppingCart, href: "/family/shopping" },
  { title: "Tasks", icon: CheckSquare, href: "/family/tasks" },
];

const homeItems = [
  { title: "Equipment", icon: Wrench, href: "/home/equipment" },
  { title: "Documents", icon: FileText, href: "/home/documents" },
  { title: "Wardrobe", icon: Shirt, href: "/home/wardrobe" },
  { title: "Dream Home", icon: Castle, href: "/home/dream-home" },
  { title: "Dream Home Wishlist", icon: ListChecks, href: "/home/wishlist" },
];

const healthItems = [
  { title: "Health", icon: Heart, href: "/health" },
];

const wealthItems = [
  { title: "Budget", icon: Wallet, href: "/budget" },
  { title: "Net Worth", icon: Landmark, href: "/wealth/net-worth" },
  { title: "Investments", icon: TrendingUp, href: "/wealth/investments" },
  { title: "Loyalty", icon: Award, href: "/loyalty" },
];

const happinessItems = [
  { title: "Happiness", icon: Smile, href: "/happiness" },
  { title: "Restaurants", icon: UtensilsCrossed, href: "/happiness/restaurants" },
];

interface PillarGroup {
  label: string;
  icon: typeof Heart;
  items: typeof faithItems;
}

const pillarGroups: PillarGroup[] = [
  { label: "Faith", icon: Church, items: faithItems },
  { label: "Family", icon: Users, items: familyItems },
  { label: "Home", icon: Home, items: homeItems },
  { label: "Health", icon: Heart, items: healthItems },
  { label: "Wealth", icon: TrendingUp, items: wealthItems },
  { label: "Happiness", icon: Smile, items: happinessItems },
];

function isActive(location: string, href: string, exactMatch?: boolean): boolean {
  if (exactMatch || href === "/" || href === "/family/crm" || href === "/sanctuary") {
    return location === href;
  }
  return location.startsWith(href);
}

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="size-4" />
          </div>
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Drake Family
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard — top-level item */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/"}
                  tooltip="Dashboard"
                >
                  <Link href="/">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Six Pillar Groups */}
        {pillarGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="label-caps">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(location, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserSelector />
      </SidebarFooter>
    </Sidebar>
  );
}
