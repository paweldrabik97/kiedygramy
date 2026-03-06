import React from "react";
import DicePhysicsScene from "../features/landing/components/DicePhysicsScene.jsx";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../features/landing/components/LanguageSelector.jsx";

const LandingPage = () => {
  const { t } = useTranslation();
  const NAVBAR_HEIGHT = 80;
  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark font-sans text-text-main dark:text-text-inverse overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* --- NAVBAR --- */}
      <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white relative shadow-lg shadow-primary/30">
                <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
                    <path d="M50 5 L20 40 L80 40 Z" />
                    <path d="M20 40 L50 85 L80 40" />
                    <path d="M20 40 L7 72" />
                    <path d="M80 40 L93 72" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-white dark:border-surface-dark"></div>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
              KiedyGramy<span className="text-primary">.</span>
            </span>
          </div>

            {/* Language Selector */}
            <LanguageSelector variant="landing" isLogged={false} />

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <a href="/auth" className="hidden md:block text-sm font-medium text-text-muted hover:text-primary transition-colors">
              {t("landing.nav.login")}
            </a>
            <a
              href="/auth"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 px-5 rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              {t("landing.nav.joinNow")}
            </a>
          </div>
        </div>
      </header>

       {/* --- HERO SECTION (WITH DICE) --- */}
       {/* Set h-[100dvh] to fill the entire device screen. Relative keeps dice contained inside. */}
      <section className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden">
        
         {/* BACKGROUND: 3D SCENE */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
           {/* Dice are rendered here and constrained by this div's dimensions */}
             <DicePhysicsScene topBarrierOffset={NAVBAR_HEIGHT} />
             
           {/* Bottom gradient overlay for a smooth transition to the next section */}
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface-light dark:from-surface-dark to-transparent pointer-events-none"></div>
        </div>

         {/* HERO CONTENT */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pointer-events-none">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/10 border border-primary/20 backdrop-blur-sm mb-8 animate-fade-in-down pointer-events-auto shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-sm font-medium text-primary dark:text-secondary">{t("landing.heroBadge")}</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.1] mb-6 text-slate-900 dark:text-white drop-shadow-sm">
            {t("landing.heroTitleLine1")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {t("landing.heroTitleHighlight")}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm bg-white/30 dark:bg-black/30 backdrop-blur-[2px] rounded-lg p-2">
            {t("landing.heroSubtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <a
              href="/auth"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-xl shadow-primary/30 transition-transform hover:-translate-y-1"
            >
              {t("landing.heroStartFree")}
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto bg-white dark:bg-surface-card hover:bg-gray-50 dark:hover:bg-gray-700 text-text-main dark:text-white font-semibold text-lg py-4 px-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors"
            >
              {t("landing.heroSeeFeatures")}
            </a>
          </div>
        </div>
      </section>


      {/* --- SOCIAL PROOF (STATS) --- */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-card relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { label: t('landing.socialProof.sessionsPlayed'), value: '10k+' },
                  { label: t('landing.socialProof.availableGames'), value: '2.5k' },
                  { label: t('landing.socialProof.activePlayers'), value: '500+' },
                  { label: t('landing.socialProof.savedEvenings'), value: '∞' },
                ].map((stat, index) => (
                    <div key={index}>
                        <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">{stat.value}</p>
                        <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>


      {/* --- FEATURES (CARDS) --- */}
      <section id="features" className="py-24 bg-surface-light dark:bg-surface-dark relative z-20">
        <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-16">
                <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white mb-4">
                {t("landing.features.sectionTitle")}
                </h2>
                <p className="text-text-muted max-w-2xl mx-auto">
                {t("landing.features.sectionSubtitle")}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="group bg-white dark:bg-surface-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <GamepadIcon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">{t("landing.features.libraryTitle")}</h3>
                    <p className="text-text-muted leading-relaxed">
                      {t("landing.features.libraryDescription")}
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="group bg-white dark:bg-surface-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full"></div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <CalendarIcon className="w-7 h-7 text-secondary-dark" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">{t("landing.features.scheduleTitle")}</h3>
                    <p className="text-text-muted leading-relaxed">
                      {t("landing.features.scheduleDescription")}
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="group bg-white dark:bg-surface-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <UsersIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">{t("landing.features.teamHubTitle")}</h3>
                    <p className="text-text-muted leading-relaxed">
                      {t("landing.features.teamHubDescription")}
                    </p>
                </div>
            </div>
        </div>
      </section>


      {/* --- HOW IT WORKS --- */}
      <section className="py-24 bg-white dark:bg-surface-card relative z-20 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                    <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white">
                    {t("landing.howItWorks.title")}
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold text-text-muted shrink-0">1</div>
                            <div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t("landing.howItWorks.step1Title")}</h4>
                        <p className="text-text-muted text-sm">{t("landing.howItWorks.step1Description")}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold text-text-muted shrink-0">2</div>
                            <div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t("landing.howItWorks.step2Title")}</h4>
                        <p className="text-text-muted text-sm">{t("landing.howItWorks.step2Description")}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-primary/30">3</div>
                            <div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t("landing.howItWorks.step3Title")}</h4>
                        <p className="text-text-muted text-sm">{t("landing.howItWorks.step3Description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Placeholder for app image/screenshot */}
                <div className="flex-1 bg-surface-light dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="aspect-video bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-text-muted">
                    <img src="../../assets/screenshot.jpg" alt={t("landing.screenshotAlt")} className="max-h-full max-w-full object-contain" />
                    </div>
                </div>
            </div>
        </div>
      </section>


      {/* --- CTA SECTION --- */}
      <section className="py-20 relative z-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary dark:bg-primary-dark"></div>
        {/* Decorative circles in the background */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-6">
                {t("landing.cta.title")}
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                {t("landing.cta.subtitle")}
            </p>
            <a
              href="/auth"
              className="inline-block bg-white text-primary font-bold text-lg py-4 px-10 rounded-full shadow-xl hover:bg-gray-50 transition-colors transform hover:scale-105"
            >
              {t("landing.cta.button")}
            </a>
            <p className="mt-6 text-sm text-white/60">{t("landing.cta.footnote")}</p>
        </div>
      </section>


      {/* --- FOOTER --- */}
      <footer className="bg-surface-light dark:bg-surface-dark py-12 border-t border-gray-200 dark:border-gray-800 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                    {/* Mini logo */}
                    <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
                        <path d="M50 5 L20 40 L80 40 Z" />
                        <path d="M20 40 L50 85 L80 40" />
                        <path d="M20 40 L7 72" />
                        <path d="M80 40 L93 72" />
                    </svg>
                </div>
                <span className="font-display font-bold text-xl text-text-muted">KiedyGramy</span>
            </div>
            
            <div className="text-text-muted text-sm">
              {t("landing.footer.copyright", { year: new Date().getFullYear() })}
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-text-muted hover:text-primary transition-colors">{t("landing.footer.terms")}</a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors">{t("landing.footer.privacy")}</a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors">{t("landing.footer.contact")}</a>
            </div>
        </div>
      </footer>

    </div>
  );
};

// --- SIMPLE SVG ICONS ---
const GamepadIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
);
const CalendarIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);

export default LandingPage;