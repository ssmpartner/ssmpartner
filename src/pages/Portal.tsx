import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ExternalLink, Shield, BarChart3, Users, Loader2, BookOpen, Brain, Globe, Calculator, UserCircle, Newspaper, ArrowRight, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import myssmLogo from "@/assets/myssm-logo.png";
import { Link } from "react-router-dom";
import { UrgentNewsBanner } from "@/components/news/UrgentNewsBanner";
import { ImportantNewsModal } from "@/components/news/ImportantNewsModal";
import { NewsCard, NewsCardData } from "@/components/news/NewsCard";

const projectMeta: Record<string, { icon: React.ReactNode; description: string; color: string }> = {
  "ssm-partner": {
    icon: <Shield className="h-8 w-8" />,
    description: "Website & CMS verwalten",
    color: "from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]",
  },
  "ssm-recruit": {
    icon: <Users className="h-8 w-8" />,
    description: "Recruiting & Lead-Management",
    color: "from-indigo-600 to-indigo-400",
  },
  "ssm-cockpit": {
    icon: <BarChart3 className="h-8 w-8" />,
    description: "Vertriebssteuerung & Analysen",
    color: "from-emerald-600 to-emerald-400",
  },
};

const externalApps = [
  {
    name: "BrokerAdmin",
    description: "Kunden & Lead-Management",
    url: "https://brokeradmin.ch/login",
    icon: <Users className="h-8 w-8" />,
    color: "from-sky-600 to-sky-400",
  },
  {
    name: "SSM Academy",
    description: "Das Digitale Lernprogramm",
    url: "https://academy.ssmpartner.ch/login",
    icon: <BookOpen className="h-8 w-8" />,
    color: "from-amber-600 to-amber-400",
  },
  {
    name: "SSM Wiki",
    description: "Die Wissensdatenbank",
    url: "https://wiki.ssmpartner.ch/xwiki/bin/login/XWiki/XWikiLogin?xredirect=%2Fxwiki%2Fbin%2Fview%2FMain%2F",
    icon: <Globe className="h-8 w-8" />,
    color: "from-violet-600 to-violet-400",
  },
  {
    name: "SSM Vorsorge",
    description: "Vorsorge Rechner",
    url: "https://ssm-vorsorge.ch/login",
    icon: <Calculator className="h-8 w-8" />,
    color: "from-rose-600 to-rose-400",
  },
  {
    name: "Abacus",
    description: "Mein Personaldossier",
    url: "https://ssm.arcon.ch:20516/oauth/oauth2/v1/auth?response_type=code&client_id=myabacus&redirect_uri=%2Fportal%2Fmyabacus%2Foauthcb&scope=abacus+abacus.entity+openid+lic.app.any.opt.abaconnect&state=NDMC6HUT7X78B2UY&response_mode=form_post",
    icon: <UserCircle className="h-8 w-8" />,
    color: "from-teal-600 to-teal-400",
  },
];

const Portal = () => {
  const { user, profile, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [redirectingProject, setRedirectingProject] = useState<string | null>(null);

  const { data: accessibleProjects, isLoading } = useQuery({
    queryKey: ["portal-projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get user's project access
      const { data: access } = await supabase
        .from("project_access" as any)
        .select("project_id, active, sso_projects(id, project_key, name, api_url, active)")
        .eq("user_id", user!.id)
        .eq("active", true) as any;

      // Also check if user is superadmin (has access to everything)
      const { data: roleData } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user!.id)
        .single() as any;

      const isSuperadmin = roleData?.role === "superadmin";

      if (isSuperadmin) {
        // Superadmin gets all active projects
        const { data: allProjects } = await supabase
          .from("sso_projects" as any)
          .select("*")
          .eq("active", true)
          .order("created_at") as any;
        return allProjects || [];
      }

      // Regular user: only projects they have access to
      return (access || [])
        .filter((a: any) => a.sso_projects?.active)
        .map((a: any) => a.sso_projects);
    },
  });

  const { data: latestNews } = useQuery({
    queryKey: ["portal-latest-news", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("news_posts" as any)
        .select("id, title, slug, excerpt, cover_image_url, cover_video_url, tags, published_at, created_at, is_important, is_highlight, news_categories(name, color)")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(10) as any;
      const ids = (posts || []).map((p: any) => p.id);
      if (!ids.length) return [];
      const [{ data: likes }, { data: comments }, { data: views }] = await Promise.all([
        supabase.from("news_likes" as any).select("post_id").in("post_id", ids) as any,
        supabase.from("news_comments" as any).select("post_id").in("post_id", ids).eq("hidden", false) as any,
        supabase.from("news_views" as any).select("post_id").in("post_id", ids) as any,
      ]);
      const tally = (rows: any[]) => {
        const m: Record<string, number> = {};
        (rows || []).forEach((r: any) => { m[r.post_id] = (m[r.post_id] || 0) + 1; });
        return m;
      };
      const lc = tally(likes), cc = tally(comments), vc = tally(views);
      return (posts || []).map((p: any): NewsCardData => ({
        ...p, category: p.news_categories,
        _count: { likes: lc[p.id] || 0, comments: cc[p.id] || 0, views: vc[p.id] || 0 },
      }));
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-body">Laden...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleProjectClick = async (project: any) => {
    if (project.project_key === "ssm-partner") {
      navigate("/admin");
      return;
    }

    // For external projects: generate SSO redirect token, then redirect
    if (!project.api_url) {
      toast.error("Keine Projekt-URL konfiguriert");
      return;
    }

    const popup = window.open("about:blank", "_blank");
    setRedirectingProject(project.project_key);

    try {
      const { data, error } = await supabase.functions.invoke("sso-auth", {
        body: { action: "generate_redirect_token", project_key: project.project_key },
      });

      if (error || data?.error) {
        popup?.close();
        throw new Error(data?.error || error?.message || "Token-Generierung fehlgeschlagen");
      }

      const redirectUrl = new URL("/sso-callback", project.api_url);
      redirectUrl.searchParams.set("token", data.token);
      redirectUrl.searchParams.set("project_key", project.project_key);

      if (!popup) {
        throw new Error("Neuer Tab konnte nicht geöffnet werden. Bitte Pop-up-Blocker prüfen.");
      }

      popup.location.replace(redirectUrl.toString());
      popup.opener = null;
    } catch (err: any) {
      popup?.close();
      toast.error(err.message || "SSO-Redirect fehlgeschlagen");
    } finally {
      setRedirectingProject(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ImportantNewsModal />
      <UrgentNewsBanner />
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground font-heading">SSM Partner AG</h1>
            <p className="text-sm text-muted-foreground font-body">MySSM</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground font-body">
                {profile?.display_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground font-body capitalize">{role || "—"}</p>
            </div>
            {profile?.avatar_url && (
              <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            )}
            <button
              onClick={() => signOut()}
              className="h-9 w-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-10 flex flex-col items-center">
            <img src={myssmLogo} alt="MySSM" className="h-14 mb-4" loading="lazy" />
            <h2 className="text-2xl font-semibold text-foreground font-heading">
              Willkommen, {profile?.display_name?.split(" ")[0] || "zurück"}
            </h2>
            <p className="text-muted-foreground font-body mt-1">
              Wähle deine App, um fortzufahren
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : accessibleProjects?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-body">
                Ihnen wurden noch keine Projekte zugewiesen.
              </p>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Kontaktieren Sie einen Administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {accessibleProjects?.map((project: any) => {
                const meta = projectMeta[project.project_key] || {
                  icon: <ExternalLink className="h-8 w-8" />,
                  description: project.name,
                  color: "from-gray-600 to-gray-400",
                };
                const isExternal = project.project_key !== "ssm-partner";

                return (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    disabled={redirectingProject === project.project_key}
                    className="group relative rounded-2xl border bg-card p-6 text-left shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {/* Gradient icon area */}
                    <div
                      className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform`}
                    >
                      {meta.icon}
                    </div>

                    <h3 className="text-lg font-semibold text-foreground font-heading">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body mt-1">
                      {meta.description}
                    </p>

                    <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary font-body">
                      {redirectingProject === project.project_key ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Verbinden...
                        </>
                      ) : isExternal ? (
                        <>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Öffnen
                        </>
                      ) : (
                        <>
                          <Shield className="h-3.5 w-3.5" />
                          Admin öffnen
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* News & Communication */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground font-heading">Aktuelle News</h3>
                  <p className="text-xs text-muted-foreground font-body">Interne Mitteilungen & Updates</p>
                </div>
              </div>
              <Link
                to="/portal/news"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline font-body"
              >
                Alle anzeigen
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {latestNews && latestNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestNews.slice(0, 6).map((n) => (
                  <NewsCard key={n.id} news={n} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
                <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Noch keine News veröffentlicht.</p>
              </div>
            )}
          </div>

          {/* External Apps */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground font-heading mb-6">Weitere Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {externalApps.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl border bg-card p-6 text-left shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform`}
                  >
                    {app.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground font-heading">
                    {app.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mt-1">
                    {app.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary font-body">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Öffnen
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center">
        <p className="text-xs text-muted-foreground font-body">
          SSM Partner AG — Zentrales Single Sign-On Portal
        </p>
      </footer>
    </div>
  );
};

export default Portal;
