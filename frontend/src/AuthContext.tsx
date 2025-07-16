//makes the user auth from backend accessible to frontend
//manages auth state, login/signup/logout, and token storage
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL;

interface AuthContextType {
    currentUser: UserToken | null;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface UserToken {
    token: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
//AuthContext gets its value from the value prop of the AuthContext.Provider component

export function useAuth() {
    //will give components access to auth data from AuthContext
    //AuthContext contains auth state, login/signup/logout, and token storage
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

export const AuthProvider = ( {children}: {children: ReactNode}) => {
    //component that will wrap the app
    //everytime it renders AuthContext.Provider's value is set
    const [currentUser, setCurrentUser] = useState<UserToken | null> (null);
    useEffect (() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.defaults.headers.common["Authorization"] = token;
            setCurrentUser({ token });
        }
    }, []);
    //signup function
    const signup = async (username: string, password: string) => {
        await axios.post(`${BACKEND_URL}/signup`, { username, password });
        //sends post request to /signup endpoint
    };
    //login function
    const login = async (username: string, password: string) => {
        //post request to /login endpoint
        const res = await axios.post(`${BACKEND_URL}/login`, { username, password });
        const authToken = res.data.token;
        localStorage.setItem(`${BACKEND_URL}/token`, authToken);
        axios.defaults.headers.common["Authorization"] = authToken; 
            //setting the header
            //every requst to api will have this header so backend knows which user is making the request
        setCurrentUser({ token: authToken });
        //storing the auth token in local storage
        localStorage.setItem('token', authToken);
    };
    //logout function
    const logout = () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setCurrentUser(null);
    };
    return (
        <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
          {children}
        </AuthContext.Provider>
    );
};