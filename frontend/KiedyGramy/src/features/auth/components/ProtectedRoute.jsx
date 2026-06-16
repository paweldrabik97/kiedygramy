import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export const ProtectedRoute = ({ children }) => {
    const { t } = useTranslation();
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="p-10 text-center">{t('featureComponents.auth.protectedRoute.checkingPermissions')}</div>;
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (user.isGuest) {
        const allowedPath = user.guestSessionId ? `/sessions/${user.guestSessionId}` : null;
        const isAllowed   = allowedPath && location.pathname === allowedPath;
        if (!isAllowed) {
            return <Navigate to={allowedPath ?? "/auth"} replace />;
        }
    }

    return children;
};