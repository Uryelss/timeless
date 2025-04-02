// File: AppLayout.js
import React from "react";
import { getUserRole, isAuthenticated, getUser } from "./AccessPage/Auth";
import FloatingChatButton from "./ChatPage/FloatingChatButton";
import AdminChatInbox from "./ChatPage/AdminChatInbox";

const AppLayout = ({ children }) => {
    const user = getUser();
    const userId = user ? user.id : null;
    const role = getUserRole(); // should return "admin" for admins, "user" for regular users

    console.log(
        "User:",
        user,
        "Role:",
        role,
        "Authenticated:",
        isAuthenticated()
    );

    return (
        <div>
            {children}
            {isAuthenticated() &&
                (role === "admin" ? (
                    <AdminChatInbox />
                ) : (
                    <FloatingChatButton userId={userId} />
                ))}
        </div>
    );
};

export default AppLayout;
