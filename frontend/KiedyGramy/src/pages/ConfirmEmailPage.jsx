import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../features/auth/contexts/AuthContext.jsx";
import { confirmEmail as apiConfirmEmail, resendConfirmationEmail } from "../features/auth/services/auth.ts";
import { useTranslation } from "react-i18next";

const ConfirmEmailPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const [status, setStatus] = useState("loading");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");

    if (!token || !email) {
      console.error("ConfirmEmailPage: missing token or email in URL");
      setStatus("error");
      return;
    }

    const run = async () => {
      try {
        await apiConfirmEmail(email, token);
        console.log("✓ Email confirmed");
      } catch (err) {
        console.error("✗ Confirmation API failed:", err?.message ?? err);
        setStatus("error");
        return;
      }

      try {
        await refreshUser();
        console.log("✓ Auto-login succeeded");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.warn("⚠ Auto-login failed (me() returned error):", err?.message ?? err);
        navigate("/auth", { replace: true });
      }
    };

    run();
  }, []);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendConfirmationEmail(email);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 4000);
    } catch {
      // ignore
    } finally {
      setResendLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-text-muted">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-medium">{t("confirmEmail.activating")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-card rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center">
        <div className="w-20 h-20 mb-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">
          {t("confirmEmail.errorTitle")}
        </h3>
        <p className="text-text-muted dark:text-slate-400 text-sm leading-relaxed mb-7">
          {t("confirmEmail.failed")}
        </p>

        {email && (
          <button
            onClick={handleResend}
            disabled={resendLoading || resendSent}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white rounded-xl shadow-lg shadow-primary/30 transition-all font-bold text-base mb-3"
          >
            {resendSent
              ? t("confirmEmail.resendSent")
              : resendLoading
              ? t("confirmEmail.resendSending")
              : t("confirmEmail.resendLink")}
          </button>
        )}

        <Link
          to="/auth"
          className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
        >
          {t("confirmEmail.backToLogin")}
        </Link>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
