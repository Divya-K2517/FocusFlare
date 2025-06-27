//redirects to login page if not authenticated
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = ({children}: {children: React.ReactNode}) => {
    const { currentUser } = useAuth();
    return currentUser ? <>{children}</> : <Navigate to="/login" />;
};