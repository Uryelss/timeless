// auth.js

// Retrieve the token from localStorage
export const getToken = () => {
    return localStorage.getItem("token");
};

// Retrieve the user object from localStorage and parse it
export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

// Get the user's role (assuming the role is stored as user.role.name)
export const getUserRole = () => {
    const user = getUser();
    return user && user.role ? user.role.name : null;
};

// Check if the user is authenticated (has a token and a valid user)
export const isAuthenticated = () => {
    return !!getToken() && !!getUser();
};

// Check if the authenticated user has one of the allowed roles
export const hasRole = (allowedRoles = []) => {
    const role = getUserRole();
    return allowedRoles.includes(role);
};
