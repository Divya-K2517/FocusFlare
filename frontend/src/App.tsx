import React from "react";
import { useAuth } from "./AuthContext";
import AuthPage from "./AuthPage"; // see below
import MainApp from "./MainApp";   // see below

function App() {
  const { currentUser } = useAuth();

  // Show AuthPage if not logged in, otherwise show MainApp
  return currentUser ? <MainApp /> : <AuthPage />;
}

export default App;