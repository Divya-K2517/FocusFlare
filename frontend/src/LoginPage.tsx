import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword]  = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
      setError(""); // clear error when route changes
    }, [location.key]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          await login(username, password);
          navigate("/");
          console.log("log in successful");
        } catch (err) {
          setError("Invalid credentials");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <input
            type="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
    );
}