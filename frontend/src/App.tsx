import React, {useEffect, useState} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeatmapPage from './HeatmapPage';
import InstructionsPage from './InstructionsPage';

// type FocusSession = {
//   id: number;
//   date: string;
//   hours: number;
// }

function App() {
  //monthly totals needs to be accessed by both the heatmap and past sessions page
  //so it is defined here
  const [monthlyTotals, setMonthlyTotals] = useState<Map<string, Map<string, number>>>(new Map());
  return (
    <Router>
      <nav>
        <Link to ="/instructions">Instructions</Link> | <Link to="/">Heatmap</Link>
      </nav>
      <Routes>
        <Route 
          path="/" 
          element={
            <HeatmapPage 
              monthlyTotals={monthlyTotals}
              setMonthlyTotals={setMonthlyTotals}
            />
          }
        />
        <Route 
          path="/instructions" 
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
