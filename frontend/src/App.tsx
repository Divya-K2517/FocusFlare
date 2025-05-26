import React, {useEffect, useState} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//import HeatmapPage from './HeatmapPage';
//import SessionsPage from './SessionsPage';

type FocusSession = {
  id: number;
  date: string;
  hours: number;
}

function App() {
  //creating a sessions state variable which is an array of Focus Sessions
  //setSessions will update sessions
  //0.5 is the default amount of hours
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [date, setDate] = useState('');
  const [hours, setHours] = useState(0.5);

  //makes a get request to the backend to get all the sessions
  //res is the response
  //setSessions will update the sessions with res.data, which is an array of FocusSession objects
  useEffect(() => {
    axios.get('http://localhost:8080/sessions')
      .then(res => setSessions(res.data));
  }, []);

  //uses post to send a new focus session to backend
  //res is the response, will add the new session to the list of sessions and re-render
  const addSession = () => {
     //making the date into RFC3339 format
     //"YYYY-MM-DDTHH:mm:ss.sssZ"
    const formattedDate = new Date(date).toISOString(); 
    //sending to backend
    axios.post('http://localhost:8080/sessions', { date: formattedDate, hours })
      .then(res => setSessions([...sessions, res.data]));
  };
  console.log("current sessions: ", sessions);
  return (
    <div style={{ padding: 24 }}>
      <h1>Study Tracker</h1>
      <div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="number" min={1} value={hours} onChange={e => setHours(Number(e.target.value))} />
        <button onClick={addSession}>Add Session</button>
      </div>
      <ul>
        {sessions.map(s => {
          let d = new Date(s.date);
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDay()).padStart(2, '0');
          const yy = String(d.getFullYear()).slice(-2);
          const formattedDate = `${mm}/${dd}/${yy}`;
          return (<li key={s.id}>{formattedDate}: {s.hours} hour(s)</li>);
        })}
      </ul>
    </div>
  );
}

export default App;
