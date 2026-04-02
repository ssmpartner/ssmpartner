import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Image, Users, Briefcase, FileText, LogOut, Menu as MenuIcon, ImageIcon, Building2, Inbox, Settings, Code2, Book, Video, FolderOpen, HelpCircle, Bot, MessageSquare, MessagesSquare } from "lucide-react";

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
  { to: "/admin/vag45", label: "VAG 45", icon: FileText },
  { to: "/admin/inquiries", label: "Anfragen", icon: Inbox },
  { to: "/admin/settings", label: "Einstellungen", icon: Settings },
  { to: "/admin/api-docs", label: "API-Docs", icon: Code2 },
  { to: "/admin/docs", label: "Dokumentation", icon: Book },
];

const AdminLayout = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <Link to="/" className="font-heading text-xl font-bold text-primary">SSM Partner AG</Link>
          <p className="font-body text-xs text-muted-foreground mt-1">Content Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => {
            const active = link.end
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <p className="font-body text-xs text-muted-foreground mb-2 truncate">{user?.email}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={16} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
