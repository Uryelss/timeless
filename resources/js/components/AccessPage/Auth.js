// auth.js
export const getToken = () => {
    return localStorage.getItem("token");
};

export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const getUserRole = () => {
    const user = getUser();
    return user && user.role ? user.role.name : null;
};

export const isAuthenticated = () => {
    const token = getToken();
    const user = getUser();
    return !!token && !!user;
};

export const hasRole = (allowedRoles = []) => {
    const role = getUserRole();
    return allowedRoles.includes(role);
};

export const logout = () => {
    localStorage.removeItem("token");
    window.history.pushState(null, "", "/");
    window.location.href = "/login";
};
