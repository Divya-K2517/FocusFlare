import React, { useState } from "react";
import {LoginPage} from "./LoginPage";
import {SignupPage} from "./SignupPage";
//page for login/signup
const AuthPage: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="loginSignupForm">
    <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
      {showSignup ? <SignupPage /> : <LoginPage />}
      <button onClick={() => setShowSignup(!showSignup)} style={{ marginTop: 20 }}>
        {showSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}
      </button>
    </div>
    </div>
  );
};

export default AuthPage;