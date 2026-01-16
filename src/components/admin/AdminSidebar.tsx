import {
  LayoutDashboard,
  Users,
  GitBranch,
  BarChart3,
  Mail,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Bot,
  BookOpen,
  MessageCircle,
  Code2,
  Megaphone,
  Link2,
  FileText,
  Layout,
  Briefcase,
  Rocket,
  Settings2,
  List,
  History,
  MousePointerClick,
  UserPlus,
  Workflow
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Blog Posts", url: "/admin/blog", icon: FileText },
  { title: "Leads", url: "/admin/leads", icon: Users },
  { title: "Pipeline", url: "/admin/pipeline", icon: GitBranch },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

const chatbotItems = [
  { title: "Chat Sessions", url: "/admin/chatbot/sessions", icon: MessageCircle },
  { title: "Knowledge Base", url: "/admin/chatbot/knowledge", icon: BookOpen },
  { title: "Chatbot Config", url: "/admin/chatbot", icon: Bot },
];

const automationItems = [
  { title: "Email Automation", url: "/admin/email", icon: Mail },
  { title: "WhatsApp", url: "/admin/whatsapp", icon: MessageSquare },
];

const settingsItems = [
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
  { title: "Client Previews", url: "/admin/previews", icon: Link2 },
  { title: "Embed Manager", url: "/admin/embeds", icon: Code2 },
  { title: "Settings", url: "/admin/settings", icon: Settings },

  // HR & Legal Section
  { title: "HR & Legal", url: '#', icon: FileText, isHeader: true },
  { title: "Overview", url: '/admin/hr', icon: Layout },
  { title: "Partners", url: '/admin/hr/partners', icon: Users },
  { title: "Employees", url: '/admin/hr/employees', icon: Briefcase },
  { title: "Documents", url: '/admin/hr/documents', icon: FileText },
];

const growthItems = [
  { title: "Growth Lab", url: '/admin/growth', icon: Rocket },
  { title: "Manage Workflows", url: '/admin/growth/embed-manager', icon: Workflow },
  { title: "Lead Scraper", url: '/admin/growth/leads', icon: UserPlus },
  { title: "Ads AI", url: '/admin/growth/ads', icon: MousePointerClick },
  { title: "Outreach", url: '/admin/growth/outreach', icon: List },
  { title: "Logs", url: '/admin/growth/logs', icon: History },
  { title: "Settings", url: '/admin/growth/settings', icon: Settings2 },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar
      className={`border-r border-border bg-card ${collapsed ? "w-16" : "w-64"} transition-all duration-300`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="font-bold text-foreground">HireMediaMind</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
        <SidebarTrigger className="h-8 w-8" />
      </div>

      <SidebarContent className="p-2">
        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.url)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chatbot */}
        <SidebarGroup className="mt-4">
          {!collapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2">AI Chatbot</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {chatbotItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.url)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Automation */}
        <SidebarGroup className="mt-4">
          {!collapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2">Automation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {automationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.url)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>



        {/* Growth Lab (Internal) */}
        <SidebarGroup className="mt-4 border-t border-border/50 pt-4">
          {!collapsed && <SidebarGroupLabel className="text-xs font-semibold text-primary/80 px-2 mb-2 flex items-center gap-1">Growth Lab <span className="bg-primary/20 text-primary text-[10px] px-1.5 rounded">INT</span></SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {growthItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.url)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-4">
          {!collapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2">System</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.url)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent >

      {/* Logout & Back to Site */}
      < div className="mt-auto p-4 border-t border-border space-y-2" >
        <button
          onClick={async () => {
            // Use the same logout path as the login flow
            const { logoutAdmin } = await import("@/lib/hostinger-auth");
            await logoutAdmin();
            window.location.href = "/admin/login";
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </NavLink>
      </div >
    </Sidebar >
  );
}
