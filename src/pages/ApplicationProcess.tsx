import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { Send, FileText, Users, MessageSquare, Handshake, FileCheck, Rocket, PartyPopper, ChevronRight, CheckCircle2 } from "lucide-react";

const phases = [
  {
    id: 1,
    phase: "Phase 1",
    phaseLabel: "Bewerbung",
    motivational: "Der erste Schritt zählt!",
    sub: "Zeig, was dich ausmacht!",
    icon: Send,
    color: "#6A9387",
    steps: [
      {
        title: "Bewerbung",
        icon: Send,
        desc: "Hast du die passende Stelle gefunden? Bewirb dich online über unser Bewerbungsformular. Du erhältst sofort eine Eingangsbestätigung.",
      },
      {
        title: "Bewerbungsunterlagen",
        icon: FileText,
        desc: "Deine Bewerbungsunterlagen werden vom HR-Recruiting-Partner geprüft und zur Beurteilung an die zuständige Führungsperson weitergeleitet.",
      },
      {
        title: "Auswahl",
        icon: Users,
        desc: "Wir prüfen deine Qualifikation, Fähigkeit und Soft-Skills. Passt du zu SSM, laden wir dich gerne zu einem ersten Kennenlernen ein. Du hörst innerhalb von rund einer Arbeitswoche von uns.",
      },
    ],
  },
  {
    id: 2,
    phase: "Phase 2",
    phaseLabel: "Kennenlernen",
    motivational: "Deine Chance wartet!",
    sub: "Überzeuge mit Persönlichkeit!",
    icon: MessageSquare,
    color: "#4A7A6E",
    steps: [
      {
        title: "Erstes Gespräch «Kennenlernen»",
        icon: MessageSquare,
        desc: "Im ersten Gespräch erfährst du mehr über uns und die Stelle. Wir lernen dich und deine Wünsche kennen. Wenn auf beiden Seiten alles passt, laden wir dich zu einem zweiten Gespräch ein, um deine Kompetenzen genauer kennenzulernen.",
      },
      {
        title: "Zweites Gespräch «oder Schnuppern»",
        icon: Users,
        desc: "Im Aussendienst wirst du zu einem zweiten Gespräch eingeladen, und im Innendienst laden wir dich je nach Position zu einem Schnuppertag ein. So erhältst du einen Einblick in unseren Arbeitsalltag und lernst dein zukünftiges Team kennen – perfekt, um letzte Fragen zu klären.",
      },
    ],
  },
  {
    id: 3,
    phase: "Phase 3",
    phaseLabel: "Angebot & Vertrag",
    motivational: "Einblick für beide Seiten!",
    sub: "Der Erfolg rückt näher!",
    icon: Handshake,
    color: "#3A6A5E",
    steps: [
      {
        title: "Angebot",
        icon: FileCheck,
        desc: "Du hast uns überzeugt! Wir machen dir ein konkretes Angebot.",
      },
      {
        title: "Vertrag",
        icon: Handshake,
        desc: "Du entscheidest dich für SSM. Dein Vertrag ist innerhalb von fünf Tagen in deiner Mailbox.",
      },
    ],
  },
  {
    id: 4,
    phase: "Phase 4",
    phaseLabel: "Willkommen!",
    motivational: "Fast geschafft!",
    sub: "Auf geht's zum neuen Abenteuer!",
    icon: PartyPopper,
    color: "#2A5A4E",
    steps: [
      {
        title: "Willkommen an Board!",
        icon: Rocket,
        desc: "Dein erster Tag bei SSM ist da! Wir freuen uns, dich im Team zu begrüssen. Damit du dich schnell bei uns zu Hause fühlst, gibt dir unser «WelcomeDay» einen ersten Einblick in unser Unternehmen. Wir wünschen dir viel Erfolg und Freude!",
      },
    ],
  },
];

const ApplicationProcess = () => {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <main>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl relative">
          <AnimatedSection>
            <span className="font-body text-xs font-medium uppercase tracking-widest text-muted-foreground">Karriere bei SSM</span>
            <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight mt-3">
              Dein Weg zu uns
            </h1>
            <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
              Von der Bewerbung bis zum ersten Tag — erfahre Schritt für Schritt, wie dein Einstieg bei SSM Partner aussieht.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Phase Navigation */}
      <section className="border-t sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 -mx-6 px-6 lg:mx-0 lg:px-0">
            {phases.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActivePhase(i)}
                className={`flex items-center gap-2 px-5 py-4 font-body text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activePhase === i
                    ? "border-current text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={activePhase === i ? { color: p.color, borderColor: p.color } : {}}
              >
                {i < activePhase ? (
                  <CheckCircle2 size={18} className="text-primary" />
                ) : (
                  <p.icon size={18} />
                )}
                <span className="hidden sm:inline">{p.phase}:</span> {p.phaseLabel}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Phase Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              {/* Motivational header */}
              <div className="text-center mb-16">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 font-body text-xs font-medium uppercase tracking-widest px-4 py-2 rounded-full text-white"
                  style={{ backgroundColor: phases[activePhase].color }}
                >
                  {phases[activePhase].phase}
                </motion.span>
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-heading text-3xl lg:text-4xl font-bold text-foreground mt-5"
                >
                  {phases[activePhase].motivational}
                </motion.h2>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-body text-base text-muted-foreground mt-2"
                >
                  {phases[activePhase].sub}
                </motion.p>
              </div>

              {/* Steps */}
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-6 top-0 bottom-0 w-px hidden md:block"
                  style={{ backgroundColor: phases[activePhase].color + "30" }}
                />

                <div className="space-y-8">
                  {phases[activePhase].steps.map((step, si) => (
                    <motion.div
                      key={si}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + si * 0.15 }}
                      className="relative flex gap-6"
                    >
                      {/* Timeline dot */}
                      <div
                        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center relative z-10"
                        style={{ backgroundColor: phases[activePhase].color }}
                      >
                        <step.icon size={22} className="text-white" />
                      </div>

                      {/* Card */}
                      <div className="flex-1 bg-card border border-border rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <h3 className="font-heading text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t">
                {activePhase > 0 ? (
                  <button
                    onClick={() => setActivePhase(activePhase - 1)}
                    className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    {phases[activePhase - 1].phaseLabel}
                  </button>
                ) : (
                  <div />
                )}

                {activePhase < phases.length - 1 ? (
                  <button
                    onClick={() => setActivePhase(activePhase + 1)}
                    className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: phases[activePhase + 1].color }}
                  >
                    Weiter: {phases[activePhase + 1].phaseLabel}
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <Link
                    to="/kontakt?subject=career"
                    className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#6A9387" }}
                  >
                    <Send size={16} />
                    Jetzt bewerben
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 border-t" style={{ background: "linear-gradient(135deg, #6A938710, #2A5A4E10)" }}>
        <div className="container mx-auto px-6 lg:px-8 text-center max-w-2xl">
          <AnimatedSection>
            <PartyPopper size={48} className="mx-auto mb-6" style={{ color: "#6A9387" }} />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              Bereit für den nächsten Schritt?
            </h2>
            <p className="font-body text-base text-muted-foreground mt-4 leading-relaxed">
              Wir freuen uns auf deine Bewerbung und darauf, dich kennenzulernen.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                to="/kontakt?subject=career"
                className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#6A9387" }}
              >
                <Send size={16} />
                Jetzt bewerben
              </Link>
              <Link
                to="/karriere"
                className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
              >
                Zurück zur Karriereseite
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default ApplicationProcess;
