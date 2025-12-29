import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 

export const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // 1. Najpierw sprawdzamy, czy nadal trwa sprawdzanie sesji
    if (isLoading) {
        return <div className="p-10 text-center">Sprawdzanie uprawnień...</div>;
    }

    // 2. Jeśli sprawdzanie się skończyło i nadal nie ma usera -> Kierunek: Logowanie
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // 3. Jeśli user jest -> wpuszczamy do środka (renderujemy stronę)
    return children;
};