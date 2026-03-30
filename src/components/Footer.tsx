import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";

const languages: Language[] = ["de", "fr", "it", "en"];

const Footer = () => {
  const { lang, setLang, t } = useLanguage();

  return (
    <footer className="border-t">
      <div className="container mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-body text-muted-foreground">
        <span>© 2025 SSM Partner AG</span>

        <div className="flex items-center gap-4">
          <Link to="#" className="hover:text-foreground transition-colors">{t("footer.imprint")}</Link>
          <Link to="#" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
          <Link to="#" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {languages.map((l, i) => (
              <span key={l} className="flex items-center">
                <button
                  onClick={() => setLang(l)}
                  className={`px-0.5 uppercase transition-colors ${lang === l ? "text-accent" : "hover:text-foreground"}`}
                >
                  {l}
                </button>
                {i < languages.length - 1 && <span>|</span>}
              </span>
            ))}
          </div>
          {/* LinkedIn */}
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-foreground transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
