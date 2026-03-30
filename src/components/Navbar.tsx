import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const languages: Language[] = ["de", "fr", "it", "en"];

const SSMLogo = () => (
  <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="22" fontFamily="'Space Grotesk', sans-serif" fontSize="24" fontWeight="700" fill="#243e3a" letterSpacing="-0.5">SSM</text>
  </svg>
);

const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/ueber-uns", label: t("nav.about") },
    { to: "/team", label: t("nav.team") },
    { to: "/karriere", label: t("nav.career") },
    { to: "/kontakt", label: t("nav.vag") },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop floating pill navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${
          scrolled ? "pt-2" : "pt-4"
        }`}
      >
        <div
          className="hidden lg:flex items-center gap-3 bg-white rounded-full px-5 py-2 transition-shadow duration-300"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
            border: "0.5px solid rgba(36,62,58,0.12)",
          }}
        >
          {/* Logo block */}
          <Link to="/" className="flex items-center gap-2.5 pr-3">
            <span className="font-heading text-[22px] font-bold tracking-tight" style={{ color: "#243e3a" }}>
              SSM
            </span>
            <div className="w-px h-8 bg-border" />
            <div className="leading-tight" style={{ fontSize: "9px" }}>
              <span style={{ color: "#243e3a" }}>Eine Tochtergesellschaft der Visana-Gruppe.</span>
              <br />
              <span className="text-muted-foreground">Gebundener Vermittler gemäss VAG.</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body transition-all duration-200 rounded-full px-3.5 py-1.5"
                style={{
                  fontSize: "12.5px",
                  backgroundColor: isActive(link.to) ? "#e8f0ef" : "transparent",
                  color: isActive(link.to) ? "#243e3a" : "#4a5568",
                  fontWeight: isActive(link.to) ? 500 : 400,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language switcher */}
          <div className="flex items-center gap-0.5 ml-1">
            {languages.map((l, i) => (
              <span key={l} className="flex items-center">
                <button
                  onClick={() => setLang(l)}
                  className="font-body uppercase transition-colors px-0.5"
                  style={{
                    fontSize: "10px",
                    color: lang === l ? "#243e3a" : "#a0aab0",
                    fontWeight: lang === l ? 600 : 400,
                  }}
                >
                  {l}
                </button>
                {i < languages.length - 1 && (
                  <span style={{ color: "#d1d5db", fontSize: "10px" }}>|</span>
                )}
              </span>
            ))}
          </div>

          {/* Contact button */}
          <Link
            to="/kontakt"
            className="font-body text-xs font-medium rounded-full px-5 py-2 transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: "#243e3a",
              color: "#ffffff",
            }}
          >
            {t("nav.cta")}
          </Link>
        </div>

        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center justify-between w-full mx-4 rounded-full px-5 py-2.5 bg-white"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
            border: "0.5px solid rgba(36,62,58,0.12)",
          }}
        >
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold" style={{ color: "#243e3a" }}>SSM</span>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ color: "#243e3a" }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-lg transition-colors rounded-full px-6 py-2"
                style={{
                  backgroundColor: isActive(link.to) ? "#e8f0ef" : "transparent",
                  color: isActive(link.to) ? "#243e3a" : "#4a5568",
                  fontWeight: isActive(link.to) ? 500 : 400,
                }}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/kontakt"
              className="font-body text-sm font-medium rounded-full px-7 py-3 mt-2 transition-all hover:opacity-90"
              style={{ backgroundColor: "#243e3a", color: "#ffffff" }}
            >
              {t("nav.cta")}
            </Link>

            <div className="flex items-center gap-2 text-sm font-body mt-4">
              {languages.map((l, i) => (
                <span key={l} className="flex items-center">
                  <button
                    onClick={() => setLang(l)}
                    className="px-1 uppercase"
                    style={{
                      color: lang === l ? "#243e3a" : "#a0aab0",
                      fontWeight: lang === l ? 600 : 400,
                    }}
                  >
                    {l}
                  </button>
                  {i < languages.length - 1 && <span style={{ color: "#d1d5db" }}>|</span>}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
