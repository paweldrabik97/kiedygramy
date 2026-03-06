import React, { useEffect, useState } from "react";
import { useAuth } from "../features/auth/contexts/AuthContext.jsx";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { useTranslation } from "react-i18next";

const AuthPage = () => {
  const { t } = useTranslation();

  // --- STATE ---
  const { login, register, user } = useAuth();
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    city: "",
  });
  const [newFormData, setNewFormData] = useState({
    newUsername: "",
    newEmail: "",
    newPassword: "",
    newConfirmPassword: "",
    newFullName: "",
    newCity: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewFormData({ ...newFormData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(formData.username, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(t("auth.errors.loginFailed"));
      console.error("Login failed:", err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newFormData.newPassword !== newFormData.newConfirmPassword) {
      setError(t("auth.errors.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    try {
      await register({
        username: newFormData.newUsername,
        email: newFormData.newEmail,
        password: newFormData.newPassword,
        fullName: newFormData.newFullName,
        city: newFormData.newCity,
      });
      setRegisterSuccess(true);
      toggleMode();
    } catch (err) {
      setError(t("auth.errors.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Helper to switch mode (clears errors)
  const toggleMode = () => {
    setIsRegisterActive(!isRegisterActive);
    setError(null);
  };

  // Shared input styles
  const inputClasses =
    "w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-main dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      {/* --- BACK BUTTON --- */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-medium bg-white/80 dark:bg-surface-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm sm:text-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:inline">{t("auth.backToHome")}</span>
        <span className="sm:hidden">{t("auth.back")}</span>
      </Link>

      {/* --- MAIN CONTAINER --- */}
      {/* Changed: smaller min-h for mobile, md:min-h-650px for desktop. Flex direction for mobile */}
      <div className="relative bg-white dark:bg-surface-card rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl min-h-[550px] md:min-h-[650px] flex flex-col md:block">
        
        {/* --- LOGIN SECTION (Left side / Default mobile view) --- */}
        {/* Changed:
            - 'absolute ... w-1/2' now works only on 'md:'
            - Added mobile hide logic: 'hidden md:flex' when isRegisterActive
        */}
        <div 
          className={`
            w-full h-full flex items-center justify-center p-8 md:p-12 bg-white dark:bg-surface-card z-10 transition-all duration-700
            md:absolute md:top-0 md:left-0 md:w-1/2
            ${isRegisterActive ? 'hidden md:flex md:opacity-0 md:-z-10' : 'flex md:opacity-100 md:z-10'}
          `}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-2 text-slate-900 dark:text-white text-center">{registerSuccess ? t("auth.registrationSuccessTitle") : t("auth.welcomeBackTitle")}</h2>
            <p className="text-text-muted text-center mb-8">{t("auth.loginSubtitle")}</p>

            {error && !isRegisterActive && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t("auth.placeholders.username")}
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder={t("auth.placeholders.password")}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-sm text-primary hover:text-primary-hover font-medium">{t("auth.forgotPassword")}</a>
              </div>

              <Button type="submit" className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg shadow-primary/30 transition-all font-bold text-lg">
                {t("auth.loginButton")}
              </Button>
            </form>

            {/* Toggle link visible ONLY on mobile (md:hidden) */}
            <div className="mt-8 text-center md:hidden">
              <p className="text-text-muted text-sm">{t("auth.noAccount")}</p>
              <button 
                onClick={toggleMode}
                className="text-primary font-bold hover:underline mt-1"
              >
                {t("auth.registerLink")}
              </button>
            </div>
          </div>
        </div>

        {/* --- REGISTER SECTION (Right side / Alternative mobile view) --- */}
        {/* Changed:
          - 'absolute ... w-1/2' now works only on 'md:'
          - Added mobile hide logic: 'hidden md:flex' when !isRegisterActive
        */}
        <div 
          className={`
            w-full h-full flex items-center justify-center p-8 md:p-12 bg-white dark:bg-surface-card z-10 transition-all duration-700
            md:absolute md:top-0 md:right-0 md:w-1/2
            ${isRegisterActive ? 'flex md:opacity-100 md:z-10' : 'hidden md:flex md:opacity-0 md:-z-10'}
          `}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2 text-slate-900 dark:text-white text-center">{t("auth.registerTitle")}</h2>
            <p className="text-text-muted text-center mb-6">{t("auth.registerSubtitle")}</p>

            {error && isRegisterActive && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <input
                type="text"
                placeholder={t("auth.placeholders.username")}
                name="newUsername"
                value={newFormData.newUsername}
                onChange={handleNewInputChange}
                required
                className={inputClasses}
              />
              <input
                type="email"
                placeholder={t("auth.placeholders.email")}
                name="newEmail"
                value={newFormData.newEmail}
                onChange={handleNewInputChange}
                required
                className={inputClasses}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  placeholder={t("auth.placeholders.password")}
                  name="newPassword"
                  value={newFormData.newPassword}
                  onChange={handleNewInputChange}
                  required
                  className={inputClasses}
                />
                <input
                  type="password"
                  placeholder={t("auth.placeholders.repeat")}
                  name="newConfirmPassword"
                  value={newFormData.newConfirmPassword}
                  onChange={handleNewInputChange}
                  required
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t("auth.placeholders.fullName")}
                  name="newFullName"
                  value={newFormData.newFullName}
                  onChange={handleNewInputChange}
                  className={inputClasses}
                />
                <input
                  type="text"
                  placeholder={t("auth.placeholders.city")}
                  name="newCity"
                  value={newFormData.newCity}
                  onChange={handleNewInputChange}
                  className={inputClasses}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl shadow-lg shadow-secondary/30 transition-all font-bold text-lg mt-2">
                {loading ? t("auth.creatingButton") : t("auth.registerButton")}
              </Button>
            </form>

            {/* Toggle link visible ONLY on mobile (md:hidden) */}
            <div className="mt-8 text-center md:hidden">
              <p className="text-text-muted text-sm">{t("auth.haveAccount")}</p>
              <button 
                onClick={toggleMode}
                className="text-secondary font-bold hover:underline mt-1"
              >
                {t("auth.loginButton")}
              </button>
            </div>
          </div>
        </div>

        {/* --- OVERLAY SLIDING PANEL (Desktop only) --- */}
        {/* Changed: Added 'hidden md:block'. On mobile, the animated panel is hidden. */}
        <div
          className={`hidden md:block absolute top-0 right-0 h-full w-1/2 z-50 transition-transform duration-700 ease-in-out ${
            isRegisterActive ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {/* BASE BACKGROUND */}
          <div className="absolute inset-0 bg-white dark:bg-surface-card" />

          {/* GRADIENT 1: VIOLET (Primary) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-primary to-purple-800 transition-opacity duration-700 ease-in-out ${
              isRegisterActive ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* GRADIENT 2: GOLD/AMBER (Secondary) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-secondary to-orange-600 transition-opacity duration-700 ease-in-out ${
              isRegisterActive ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* OVERLAY CONTENT */}
          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-white px-12 text-center">
            {/* Logo inside overlay */}
            <div className="mb-8 p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary relative shadow-inner">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
                    <path d="M50 5 L20 40 L80 40 Z" />
                    <path d="M20 40 L50 85 L80 40" />
                    <path d="M20 40 L7 72" />
                    <path d="M80 40 L93 72" />
                  </svg>
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      isRegisterActive ? "bg-primary" : "bg-secondary"
                    }`}
                  ></div>
                </div>
                <span className="font-display font-bold text-3xl tracking-tight">
                  KiedyGramy
                  <span
                    className={
                      isRegisterActive ? "text-primary-dark" : "text-secondary"
                    }
                  >
                    .
                  </span>
                </span>
              </div>
            </div>

            <h2 className="text-4xl font-bold font-display mb-4 drop-shadow-md">
              {isRegisterActive ? t("auth.overlay.titleHasAccount") : t("auth.overlay.titleNewPlayer")}
            </h2>
            <p className="mb-10 text-lg text-white/90 font-medium max-w-xs leading-relaxed">
              {isRegisterActive
                ? t("auth.overlay.descriptionHasAccount")
                : t("auth.overlay.descriptionNewPlayer")}
            </p>

            <button
              onClick={toggleMode}
              className="px-10 py-3 border-2 border-white rounded-full font-bold text-lg hover:bg-white hover:text-slate-900 transition-all shadow-lg transform hover:scale-105 active:scale-95"
            >
              {isRegisterActive ? t("auth.overlay.buttonLogin") : t("auth.overlay.buttonCreateAccount")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;