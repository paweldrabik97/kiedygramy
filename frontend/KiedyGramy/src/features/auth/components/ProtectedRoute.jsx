import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 
import { useTranslation } from "react-i18next";

export const ProtectedRoute = ({ children }) => {
    const { t } = useTranslation();
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // 1. First check whether session validation is still running
    if (isLoading) {
        return <div className="p-10 text-center">{t('featureComponents.auth.protectedRoute.checkingPermissions')}</div>;
    }

    // 2. If validation is done and user is still missing -> Redirect to login
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // 3. If user exists -> allow access (render page)
    return children;
};