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
    { to: "/ueber-uns", label: t("nav.about") },
    { to: "/karriere", label: t("nav.career") },
    { to: "/kontakt", label: t("nav.contact") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-card/95 backdrop-blur-md border-b shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="font-heading text-xl lg:text-2xl font-bold tracking-tight text-foreground">
            SSM Partner AG
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-sm text-foreground/70 hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:rounded-full after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-1 text-xs font-body text-muted-foreground ml-2">
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

            <Link
              to="/kontakt"
              className="font-body text-sm font-medium border border-primary text-primary px-5 py-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {t("nav.cta")}
            </Link>
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
                className="font-heading text-3xl font-bold text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}

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

            <Link
              to="/kontakt"
              className="font-body text-sm font-medium bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all"
            >
              {t("nav.cta")}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
