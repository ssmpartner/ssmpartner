import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import ssmLogo from "@/assets/ssm-logo-green.png";
import ssmPattern from "@/assets/ssm-structure-pattern.png";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full relative overflow-hidden" style={{ backgroundColor: "#243e3a" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${ssmPattern})`, backgroundSize: "800px auto", backgroundPosition: "right bottom", backgroundRepeat: "no-repeat", opacity: 0.06, mixBlendMode: "soft-light" }} />
      <div className="container mx-auto px-6 lg:px-8 max-w-[1340px] py-16 relative z-10">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo & info */}
          <div className="md:col-span-1">
            <img
              src={ssmLogo}
              alt="SSM Partner AG"
              className="h-10 mb-4"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Eine Tochtergesellschaft der Visana-Gruppe.
              <br />
              Gebundener Vermittler gemäss VAG.
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-white mb-4">Sitemap</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/" className="font-body text-sm transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Home</Link>
              <Link to="/ueber-uns" className="font-body text-sm transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Über uns</Link>
              <Link to="/agenturen" className="font-body text-sm transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Agenturen</Link>
              <Link to="/karriere" className="font-body text-sm transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Karriere</Link>
              <Link to="/kontakt" className="font-body text-sm transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Kontakt</Link>
            </nav>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-white mb-4">Kontakt</h4>
            <div className="font-body text-sm space-y-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <p>SSM Partner AG</p>
              <p>Stationsstrasse 92</p>
              <p>CH-6023 Rothenburg</p>
              <p className="pt-2">041 220 20 50</p>
              <p>info@ssmpartner.ch</p>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-white mb-4">Social Media</h4>
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mt-12 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2025 SSM Partner AG — Alle Rechte vorbehalten.
          </span>
          <div className="flex items-center gap-4 font-body text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link to="/rechtliches?tab=impressum" className="hover:text-white transition-colors">{t("footer.imprint")}</Link>
            <Link to="/rechtliches?tab=datenschutz" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link to="/rechtliches" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
