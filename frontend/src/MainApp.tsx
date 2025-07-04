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
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}
function NavBar() { 
  //mav bar only renders if user is logged in
  const {currentUser} = useAuth();
  if (!currentUser) return null;

  return (
    <nav>
          <div className="split-navbar">
            <div className="nav-half">
              <Link to ="/">Instructions</Link> 
            </div>
            <h1 className="outline-text">Focus Flare</h1>
            <div className="nav-half">
              <Link to="/heatmap">Heatmap</Link>
            </div>
          </div>
      </nav>
  );
}
export default MainApp;
