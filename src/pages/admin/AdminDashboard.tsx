import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Image, FileText, Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: sliderCount } = useQuery({
    queryKey: ["admin-slider-count"],
    queryFn: async () => {
      const { count } = await supabase.from("slider_images").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: contentCount } = useQuery({
    queryKey: ["admin-content-count"],
    queryFn: async () => {
      const { count } = await supabase.from("site_content").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: teamCount } = useQuery({
    queryKey: ["admin-team-count"],
    queryFn: async () => {
      const { count } = await supabase.from("team_members").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: jobCount } = useQuery({
    queryKey: ["admin-job-count"],
    queryFn: async () => {
      const { count } = await supabase.from("job_positions").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const cards = [
    { label: "Slider-Bilder", count: sliderCount, icon: Image, to: "/admin/slider", color: "bg-primary" },
    { label: "Seitentexte", count: contentCount, icon: FileText, to: "/admin/content", color: "bg-info" },
    { label: "Team-Mitglieder", count: teamCount, icon: Users, to: "/admin/team", color: "bg-success" },
    { label: "Offene Stellen", count: jobCount, icon: Briefcase, to: "/admin/jobs", color: "bg-warning" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
              <card.icon size={20} className="text-primary-foreground" />
            </div>
            <p className="font-heading text-3xl font-semibold text-foreground">{card.count ?? "—"}</p>
            <p className="font-body text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
