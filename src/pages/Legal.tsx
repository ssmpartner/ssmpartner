import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";

const TABS = [
  { key: "impressum", label: "Impressum" },
  { key: "datenschutz", label: "Datenschutz" },
  { key: "socialmedia", label: "Social Media" },
] as const;

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "-").replace(/(^-|-$)/g, "");

const Legal = () => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "impressum";
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  const { data: content, isLoading } = useQuery({
    queryKey: ["site-content", "legal", lang, activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", "legal")
        .eq("lang", lang)
        .like("section_key", `${activeTab}%`)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    setActiveSection(null);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    if (!content?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    const ids = content.filter((b) => b.title).map((b) => slugify(b.title!));
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content]);

  const titledBlocks = content?.filter((b) => b.title) || [];
  const showSidebar = titledBlocks.length > 2;

  return (
    <main>
      <PageHero pageKey="legal" />

      <AnimatedSection>
        <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          {/* Tab Switch */}
          <div className="flex bg-muted rounded-xl p-1 mb-12 max-w-xl mx-auto">
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
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <p className="font-body text-sm text-muted-foreground text-center">Laden...</p>
          ) : !content?.length ? (
            <div className="text-center">
              <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
                {TABS.find((t) => t.key === activeTab)?.label || activeTab}
              </h1>
              <p className="font-body text-muted-foreground">Inhalt wird bald ergänzt.</p>
            </div>
          ) : (
            <div className={`flex gap-12 ${showSidebar ? "" : "max-w-4xl mx-auto"}`}>
              {/* Sidebar Navigation */}
              {showSidebar && (
                <aside className="hidden lg:block w-64 shrink-0">
                  <nav className="sticky top-28 space-y-1">
                    <p className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Inhaltsverzeichnis
                    </p>
                    {titledBlocks.map((block) => {
                      const id = slugify(block.title!);
                      const isActive = activeSection === id;
                      return (
                        <button
                          key={block.id}
                          onClick={() => scrollToSection(id)}
                          className={`block w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-all leading-snug ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {block.title}
                        </button>
                      );
                    })}
                  </nav>
                </aside>
              )}

              {/* Main Content */}
              <div className="flex-1 min-w-0 space-y-10" ref={contentRef}>
                {content.map((block) => {
                  const id = block.title ? slugify(block.title) : block.id;
                  return (
                    <div key={block.id} id={id} className="scroll-mt-28">
                      {block.title && (
                        <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
                          {block.title}
                        </h2>
                      )}
                      {block.body && (
                        <div className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">
                          {block.body}
                        </div>
                      )}
                      {block.link_text && block.link_url && (
                        <a
                          href={block.link_url}
                          className="font-body text-sm text-primary underline mt-2 inline-block"
                        >
                          {block.link_text}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </AnimatedSection>
    </main>
  );
};

export default Legal;
