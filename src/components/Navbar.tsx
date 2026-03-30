import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const languages: Language[] = ["de", "fr", "it", "en"];

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
    { to: "/ueber-uns", label: t("nav.team") },
    { to: "/karriere", label: t("nav.career") },
    { to: "/kontakt", label: t("nav.vag") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-card/95 backdrop-blur-md border-b shadow-sm" : "bg-card/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-heading text-2xl lg:text-3xl font-bold tracking-tight text-primary">SSM</span>
            <div className="hidden sm:block text-[10px] leading-tight text-muted-foreground font-body">
              <span>Eine Tochtergesellschaft der Visana-Gruppe.</span><br />
              <span>Gebundener Vermittler gemäss VAG.</span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-sm tracking-wide transition-colors ${
                  location.pathname === link.to
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/kontakt"
              className="font-body text-sm font-medium bg-primary/10 text-primary px-5 py-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {t("nav.cta")}
            </Link>

            <div className="flex items-center gap-1 text-xs font-body text-muted-foreground ml-1">
              {languages.map((l, i) => (
                <span key={l} className="flex items-center">
                  <button
                    onClick={() => setLang(l)}
                    className={`px-1 py-0.5 uppercase transition-colors rounded ${
                      lang === l ? "text-primary font-semibold" : "hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                  {i < languages.length - 1 && <span className="text-border">|</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-foreground"
            aria-label="Toggle menu"
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
            className="fixed inset-0 z-40 bg-card flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-heading text-2xl font-bold text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/kontakt"
              className="font-body text-sm font-medium bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-all"
            >
              {t("nav.cta")}
            </Link>

            <div className="flex items-center gap-2 text-sm font-body text-muted-foreground mt-4">
              {languages.map((l, i) => (
                <span key={l} className="flex items-center">
                  <button
                    onClick={() => setLang(l)}
                    className={`px-1 uppercase ${lang === l ? "text-primary font-semibold" : ""}`}
                  >
                    {l}
                  </button>
                  {i < languages.length - 1 && <span>|</span>}
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
