import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Image, Users, UserCog, Briefcase, FileText, LogOut, KeyRound,
  Menu as MenuIcon, ImageIcon, Building2, Inbox, Settings, Code2,
  Book, Video, FolderOpen, HelpCircle, Bot, MessagesSquare,
  MessageSquare, PanelLeftClose, PanelLeft, ExternalLink, ArrowLeftRight,
  User, ChevronDown, Newspaper, Calendar,
  Share2,
} from "lucide-react";
import { BarChart3, Search } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminLinks = [
  { to: "/admin", label: "Übersicht", icon: LayoutDashboard, end: true },
  { to: "/admin/slider", label: "Slider-Bilder", icon: Image },
  { to: "/admin/heroes", label: "Hero-Bilder", icon: ImageIcon },
  { to: "/admin/nav", label: "Menüpunkte", icon: MenuIcon },
  { to: "/admin/content", label: "Seitentexte", icon: FileText },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/agencies", label: "Agenturen", icon: Building2 },
  { to: "/admin/jobs", label: "Stellen", icon: Briefcase },
  { to: "/admin/career-videos", label: "Karriere-Videos", icon: Video },
  { to: "/admin/career-faqs", label: "Karriere-FAQ", icon: HelpCircle },
  { to: "/admin/media", label: "Mediathek", icon: FolderOpen },
  { to: "/admin/chat-knowledge", label: "KI-Chat Wissen", icon: Bot },
  { to: "/admin/chat-logs", label: "Chat-Verläufe", icon: MessagesSquare },
  { to: "/admin/onlinecheck", label: "Online-Beratung", icon: MessageSquare },
  { to: "/admin/news", label: "News & Kommunikation", icon: Newspaper },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/vag45", label: "VAG 45", icon: FileText },
  { to: "/admin/inquiries", label: "Anfragen", icon: Inbox },
  { to: "/admin/social-links", label: "Social Media", icon: Share2 },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/seo", label: "SEO Optimierung", icon: Search },
];

const bottomLinks = [
  { to: "/admin/settings", label: "Einstellungen", icon: Settings },
  { to: "/admin/users", label: "Benutzer", icon: UserCog },
  { to: "/admin/api-docs", label: "API-Docs", icon: Code2 },
  { to: "/admin/docs", label: "Dokumentation", icon: Book },
];

function SidebarNavItem({
  to, icon: Icon, label, isActive, collapsed,
}: {
  to: string; icon: React.ElementType; label: string; isActive: boolean; collapsed: boolean;
}) {
  const link = (
    <Link
      to={to}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        collapsed ? "justify-center" : ""
      } ${
        isActive
          ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="shrink-0 h-[18px] w-[18px]" />
      {!collapsed && <span className="text-sm">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

const AdminLayout = () => {
  const { signOut, user, profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Admin";
  const initials = displayName
    .split(/[\s.@]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
            collapsed ? "w-[68px]" : "w-64"
          }`}
        >
          {/* Header */}
          <div className={`flex h-16 items-center ${collapsed ? "justify-center px-2" : "gap-3 px-6"} border-b border-sidebar-border`}>
            <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary shrink-0">
              <LayoutDashboard className="h-4 w-4 text-sidebar-primary-foreground" />
            </Link>
            {!collapsed && (
              <span className="text-lg font-semibold text-white tracking-tight font-heading">
                SSM CMS
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto scrollbar-thin">
            {adminLinks.map((link) => {
              const active = link.end
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);
              return (
                <SidebarNavItem
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  isActive={active}
                  collapsed={collapsed}
                />
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-sidebar-border p-3 space-y-0.5">
            {bottomLinks.map((link) => (
              <SidebarNavItem
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                isActive={location.pathname.startsWith(link.to)}
                collapsed={collapsed}
              />
            ))}

            {/* Logout */}
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">Abmelden</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Abmelden
              </button>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex w-full items-center justify-center rounded-lg px-3 py-2 mt-1 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all duration-200"
            >
              {collapsed ? <PanelLeft className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className={`transition-all duration-300 ${collapsed ? "pl-[68px]" : "pl-64"}`}>
          {/* Top header bar */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/90 backdrop-blur-md px-8 gap-4">
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/50 transition-colors font-body"
              title="Zum Portal wechseln"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Portal
            </Link>

            <div className="flex items-center gap-2">
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary overflow-hidden ring-1 ring-border">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="text-sm hidden sm:block text-left">
                    <p className="font-medium leading-none font-body">{displayName}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 truncate max-w-[140px]">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden ring-1 ring-border shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/admin/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/admin/users" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil bearbeiten
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;
