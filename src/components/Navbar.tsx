import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ssmLogo from "@/assets/ssm-logo-green.png";

const languages: { code: Language; label: string }[] = [
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "en", label: "English" },
];

const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { data: navItems } = useQuery({
    queryKey: ["nav-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_items").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getLabel = (item: any) => {
    const key = `label_${lang}` as string;
    return item[key] || item.label_de;
  };

  const isActive = (path: string) => location.pathname === path;
  const currentLang = languages.find((l) => l.code === lang)!;

  return (
    <>
      {/* Desktop floating pill navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${
          scrolled ? "pt-3" : "pt-5"
        }`}
      >
        <div
          className="hidden lg:flex items-center justify-between w-full max-w-[1340px] bg-white rounded-2xl px-8 py-4 transition-shadow duration-300"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
            border: "0.5px solid rgba(36,62,58,0.12)",
          }}
        >
          {/* Logo block */}
          <Link to="/" className="flex items-center gap-3">
            <img src={ssmLogo} alt="SSM Partner AG" className="h-8" />
            <div className="w-px h-10 bg-border" />
            <div className="leading-tight" style={{ fontSize: "10px" }}>
              <span style={{ color: "#243e3a" }}>Eine Tochtergesellschaft der Visana-Gruppe.</span>
              <br />
              <span className="text-muted-foreground">Gebundener Vermittler gemäss VAG.</span>
            </div>
          </Link>

          {/* Center: Nav links + language + button */}
          <div className="flex items-center gap-2">
            {navItems?.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                className="font-body transition-all duration-200 rounded-xl px-5 py-2.5"
                style={{
                  fontSize: "14px",
                  backgroundColor: isActive(item.url) ? "#e8f0ef" : "transparent",
                  color: isActive(item.url) ? "#243e3a" : "#4a5568",
                  fontWeight: isActive(item.url) ? 500 : 400,
                }}
              >
                {getLabel(item)}
              </Link>
            ))}
          </div>

          {/* Language dropdown */}
          <div ref={langRef} className="relative ml-1">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 font-body text-sm rounded-xl px-4 py-2.5 transition-colors hover:bg-muted"
              style={{ color: "#4a5568" }}
            >
              <Globe size={15} />
              <span className="uppercase font-medium" style={{ color: "#243e3a" }}>{lang}</span>
              <ChevronDown size={13} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div
                className="absolute top-full right-0 mt-2 bg-white rounded-xl py-1 min-w-[150px] z-50"
                style={{
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
                  border: "0.5px solid rgba(36,62,58,0.1)",
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2.5 font-body text-sm transition-colors hover:bg-muted flex items-center justify-between"
                    style={{ color: lang === l.code ? "#243e3a" : "#4a5568", fontWeight: lang === l.code ? 500 : 400 }}
                  >
                    {l.label}
                    <span className="uppercase text-xs text-muted-foreground">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact button */}
          <Link
            to="/kontakt"
            className="font-body text-sm font-medium rounded-xl px-7 py-2.5 transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#243e3a", color: "#ffffff" }}
          >
            {t("nav.cta")}
          </Link>
          </div>
        </div>

        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center justify-between w-[calc(100%-2rem)] mx-4 rounded-full px-5 py-3 bg-white"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
            border: "0.5px solid rgba(36,62,58,0.12)",
          }}
        >
          <Link to="/" className="flex items-center gap-2">
            <img src={ssmLogo} alt="SSM Partner AG" className="h-6" />
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ color: "#243e3a" }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-6"
          >
            <img src={ssmLogo} alt="SSM Partner AG" className="h-8 mb-4" />

            {navItems?.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                className="font-body text-lg transition-colors rounded-full px-6 py-2"
                style={{
                  backgroundColor: isActive(item.url) ? "#e8f0ef" : "transparent",
                  color: isActive(item.url) ? "#243e3a" : "#4a5568",
                  fontWeight: isActive(item.url) ? 500 : 400,
                }}
              >
                {getLabel(item)}
              </Link>
            ))}

            <Link
              to="/kontakt"
              className="font-body text-sm font-medium rounded-full px-7 py-3 mt-2 transition-all hover:opacity-90"
              style={{ backgroundColor: "#243e3a", color: "#ffffff" }}
            >
              {t("nav.cta")}
            </Link>

            {/* Mobile language dropdown */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="mt-4 font-body text-sm border rounded-full px-4 py-2 bg-white"
              style={{ color: "#243e3a" }}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
