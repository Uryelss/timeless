// AppLayout.js
import React, { useState, useEffect } from "react";
import { getUserRole, isAuthenticated, getUser } from "./AccessPage/Auth";
import FloatingChatMenu from "./ChatPage/FloatingChatButton";
import AdminChatInbox from "./ChatPage/AdminChatInbox";

const AppLayout = ({ children }) => {
    const [authInfo, setAuthInfo] = useState({
        user: getUser(),
        role: getUserRole(),
    });

    useEffect(() => {
        const handleAuthChange = () => {
            setAuthInfo({
                user: getUser(),
                role: getUserRole(),
            });
        };
        // Listen for changes from other tabs...
        window.addEventListener("storage", handleAuthChange);
        // Listen for our custom "authChange" event after login
        window.addEventListener("authChange", handleAuthChange);
        return () => {
            window.removeEventListener("storage", handleAuthChange);
            window.removeEventListener("authChange", handleAuthChange);
        };
    }, []);

    return (
        <div>
            {children}
            {isAuthenticated() &&
                authInfo.user &&
                (authInfo.role === "admin" ? (
                    <AdminChatInbox />
                ) : (
                    <FloatingChatMenu userId={authInfo.user.id} />
                ))}
        </div>
    );
};

export default AppLayout;
