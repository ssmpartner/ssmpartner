import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ExternalLink, Shield, BarChart3, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-body">Laden...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleProjectClick = (project: any) => {
    if (project.project_key === "ssm-partner") {
      navigate("/admin");
      return;
    }
    // For external projects, open in new tab with the project URL
    if (project.api_url) {
      window.open(project.api_url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground font-heading">SSM Partner AG</h1>
            <p className="text-sm text-muted-foreground font-body">Projektportal</p>
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground font-heading">
              Willkommen, {profile?.display_name?.split(" ")[0] || "zurück"}
            </h2>
            <p className="text-muted-foreground font-body mt-1">
              Wählen Sie ein Projekt, um fortzufahren
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
                    className="group relative rounded-2xl border bg-card p-6 text-left shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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
                      {isExternal ? (
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
