import React, { useState} from 'react';
//import axios from 'axios';
import './App.css';
import { HashRouter as Router, Routes, Route, Link  } from "react-router-dom";
//import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeatmapPage from './HeatmapPage';
import InstructionsPage from './InstructionsPage';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { ProtectedRoute } from './ProtectedRoute';
import AuthPage from './AuthPage';

//color palette used: https://www.figma.com/color-palettes/ballerina/

function MainApp() {
  //monthly totals needs to be accessed by both the heatmap and past sessions page
  //so it is defined here
  const [monthlyTotals, setMonthlyTotals] = useState<Map<string, Map<string, number>>>(new Map());
  return (
    <AuthProvider>
      <Router>
        <NavBar/>
        <Routes>
          <Route 
            path="/heatmap" 
            element={
              <ProtectedRoute>
                <HeatmapPage 
                  monthlyTotals={monthlyTotals}
                  setMonthlyTotals={setMonthlyTotals}
                />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <InstructionsPage
                />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
function NavBar() { 
  //mav bar only renders if user is logged in
  const {currentUser, logout} = useAuth();
  if (!currentUser) return null;

  return (
    <nav className="navbar">
          <div className="navbar-left">
            <div className="nav-half">
            <span className="navbar-logo" role="img" aria-label="logo">🔥</span>
            <span className="navbar-title">Focus Flare</span>
          </div>
          <div className="navbar-links">
            <Link to="/">Instructions</Link>
            <Link to="/heatmap">Heatmap</Link>
          </div>
            <div className="logoutBtn">
              <button onClick={logout}>
                Logout
              </button>
            </div>
          </div>
      </nav>
  );
}
export default MainApp;
