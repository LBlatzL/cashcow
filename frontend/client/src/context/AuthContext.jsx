import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

function decodeToken(token) {
    const payload = token.split(".")[1];

    return JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
}

function getStoredUser() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const user = decodeToken(token);

        if (user.exp * 1000 <= Date.now()) {
            localStorage.removeItem("token");
            return null;
        }

        return user;
    } catch {
        localStorage.removeItem("token");
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);

    async function login(username, password) {
        const formData = new URLSearchParams();

        formData.append("username", username);
        formData.append("password", password);

        const response = await axios.post(
            "http://127.0.0.1:8000/auth/token",
            formData
        );

        const token = response.data.access_token;
        const decodedUser = decodeToken(token);

        localStorage.setItem("token", token);
        setUser(decodedUser);
    }

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}