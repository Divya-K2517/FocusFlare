import React, {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';
import { HashRouter as Router, Routes, Route, Link  } from "react-router-dom";
//import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeatmapPage from './HeatmapPage';
import InstructionsPage from './InstructionsPage';

//color palette used: https://www.figma.com/color-palettes/ballerina/

function App() {
  //monthly totals needs to be accessed by both the heatmap and past sessions page
  //so it is defined here
  const [monthlyTotals, setMonthlyTotals] = useState<Map<string, Map<string, number>>>(new Map());
  return (
    
    <Router>
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
      <Routes>
        <Route 
          path="/heatmap" 
          element={
            <HeatmapPage 
              monthlyTotals={monthlyTotals}
              setMonthlyTotals={setMonthlyTotals}
            />
          }
        />
        <Route 
          path="/" 
          element={
            <InstructionsPage
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
