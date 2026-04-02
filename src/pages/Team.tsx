import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";

const Team = () => {
  const { lang, t } = useLanguage();

  const { data: members, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const getRole = (member: any) => {
    const key = `role_${lang}` as string;
    return member[key] || member.role_de || "";
  };

  return (
    <main>
      <PageHero pageKey="team" fallbackImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80" />

      <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f7f5" }}>
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">{t("about.team.title")}</h1>
            <div className="brand-rule mt-4" />
          </AnimatedSection>

          {isLoading ? (
            <p className="font-body text-sm text-muted-foreground mt-12">Laden...</p>
          ) : !members?.length ? (
            <div className="mt-16 grid md:grid-cols-3 gap-12 lg:gap-16">
              {[
                { name: "Martin Killer", role: "CEO" },
                { name: "Oliver Felder", role: "CIO & CRO" },
                { name: "—", role: t("about.team.member") },
              ].map((member, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="w-full aspect-square bg-muted rounded-2xl" />
                  <h3 className="font-heading text-base font-semibold text-foreground mt-4">{member.name}</h3>
                  <p className="font-body text-sm text-muted-foreground">{member.role}</p>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="mt-16 grid md:grid-cols-3 gap-12 lg:gap-16">
              {members.map((member, i) => (
                <AnimatedSection key={member.id} delay={i * 0.1}>
                  <div className="w-full aspect-square bg-muted rounded-2xl overflow-hidden">
                    {member.image_url && (
                      <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                   <h3 className="font-heading text-base font-semibold text-foreground mt-4">{member.name}</h3>
                   <p className="font-body text-sm text-muted-foreground">{getRole(member)}</p>
                   {member.badge && (
                     <span className="inline-block mt-1.5 font-body text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#6A9387" }}>
                       {({ verkaufsleiter: "Verkaufsleiter", teamleiter: "Teamleiter", finanzexperte: "Finanzexperte", finanzcoach: "Finanzcoach", finanzcoach_vbv: "Finanzcoach VBV", trainee: "Trainee" } as Record<string, string>)[member.badge] || member.badge}
                     </span>
                   )}
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Team;
