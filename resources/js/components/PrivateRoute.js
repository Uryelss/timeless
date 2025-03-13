// src/components/PrivateRoute.jsx
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import { isAuthenticated, hasRole, logout, getToken } from "./AccessPage/Auth";

const PrivateRoute = ({ allowedRoles, isLogout = false }) => {
    const location = useLocation();

    useEffect(() => {
        // Prevent back button navigation
        window.history.pushState(null, "", location.pathname);

        // Validate session
        const validateSession = async () => {
            try {
                await axios.get("http://localhost:8000/api/validate-token", {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
            } catch (error) {
                logout();
            }
        };

        if (isAuthenticated() && !isLogout) validateSession();
    }, [location, isLogout]);

    // Handle logout
    if (isLogout) {
        logout();
        return <Navigate to="/login" replace />;
    }

    // Handle authentication and role checking
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Handle redirect to home based on role if no specific allowed roles match
    if (!hasRole(allowedRoles)) {
        return (
            <Navigate
                to={hasRole(["admin"]) ? "/dashboard" : "/user-home"}
                replace
            />
        );
    }

    return <Outlet />;
};

export default PrivateRoute;
