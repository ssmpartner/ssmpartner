import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";

const TABS = [
  { key: "impressum", labelKey: "legal.impressum" },
  { key: "datenschutz", labelKey: "legal.datenschutz" },
] as const;

const Legal = () => {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "datenschutz" ? "datenschutz" : "impressum";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: content, isLoading } = useQuery({
    queryKey: ["site-content", "legal", lang, activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", "legal")
        .eq("lang", lang)
        .eq("section_key", activeTab)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <main>
      <PageHero pageKey="legal" fallbackImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600" />

      <AnimatedSection>
        <section className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
          {/* Tab Switch */}
          <div className="flex bg-muted rounded-xl p-1 mb-12 max-w-md mx-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 py-3 px-4 rounded-lg font-body text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.key === "impressum" ? "Impressum" : "Datenschutz"}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <p className="font-body text-sm text-muted-foreground text-center">Laden...</p>
          ) : !content?.length ? (
            <div className="text-center">
              <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
                {activeTab === "impressum" ? "Impressum" : "Datenschutz"}
              </h1>
              <p className="font-body text-muted-foreground">
                Inhalt wird bald ergänzt.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {content.map((block) => (
                <div key={block.id}>
                  {block.title && (
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{block.title}</h2>
                  )}
                  {block.body && (
                    <div className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">
                      {block.body}
                    </div>
                  )}
                  {block.link_text && block.link_url && (
                    <a href={block.link_url} className="font-body text-sm text-primary underline mt-2 inline-block">
                      {block.link_text}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </AnimatedSection>
    </main>
  );
};

export default Legal;
