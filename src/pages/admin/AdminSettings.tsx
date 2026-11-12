import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Shield, UserCog, KeySquare, Activity, Bot, Share2, Trash2, ChevronRight } from "lucide-react";

const AdminSettings = () => {
  const { isSuperadmin } = useAuth();
  const tiles = [
    { to: "/admin/settings/account", label: "Konto & Passwort", desc: "Kontodaten und Passwort ändern", icon: Shield },
    { to: "/admin/users", label: "Benutzer", desc: "Benutzer und Rollen verwalten", icon: UserCog },
    { to: "/admin/entra-sso", label: "Microsoft SSO", desc: "Anmeldung mit Microsoft Entra ID", icon: KeySquare },
    { to: "/admin/gsc-monitor", label: "Search Console", desc: "Indexierung und Crawling überwachen", icon: Activity },
    { to: "/admin/chat-knowledge", label: "KI-Chat Wissen", desc: "Wissensbasis des KI-Chats pflegen", icon: Bot },
    { to: "/admin/social-links", label: "Social Media", desc: "Links zu Social-Media-Kanälen", icon: Share2 },
    ...(isSuperadmin ? [{ to: "/admin/settings/trash", label: "Papierkorb", desc: "Gelöschte Einträge wiederherstellen", icon: Trash2 }] : []),
  ];
  return (
    <div className="max-w-5xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-1">Einstellungen</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">Wählen Sie einen Bereich.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="group bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-base font-semibold text-foreground">{label}</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
