import React, {useEffect, useState} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import { JSX } from 'react/jsx-runtime';


type FocusSession = {
  id: number;
  date: string;
  hours: number;
}

function HeatmapPage() {
  //creating a sessions state variable which is an array of Focus Sessions
  //setSessions will update sessions
  //0.5 is the default amount of hours
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [date, setDate] = useState('');
  const [hours, setHours] = useState(0.5);
  //month/yr that is currently displayed
  const [displayYr, setDisplayYr] = useState(() => new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(() => new Date().getMonth());
  //getting daily totals map
  const [dailyTotals, setDailyTotals] = useState<Record<string, number>>({});
  
  //makes a get request to the backend to get all the sessions
  //res is the response
  //setSessions will update the sessions with res.data, which is an array of FocusSession objects
  useEffect(() => {
    axios.get('http://localhost:8080/sessions')
      .then(res => setSessions(res.data));

    axios.get<Record<string, number>>('http://localhost:8080/daily-totals')
        .then(res => setDailyTotals(res.data))
        .catch(err => console.error("Error fetching daily totals map: ", err))
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
  
  //change month handlers
  const goToPrevMonth = () => {
    setDisplayMonth(prev => {
        if (prev === 0) { //if the month is janurary then prev = 0
            setDisplayYr(y => y - 1);
            return 11; //11 = december
        }
        return prev - 1;
    });
  };
  const goToNextMonth = () => {
    setDisplayMonth(prev => {
        if (prev === 11) { //if the month is december then prev = 11
            setDisplayYr(y => y + 1);
            return 0; //0 = january
        }
        return prev + 1;
    });
  }

  const tiles = getDisplayMonthTiles(displayMonth, displayYr)//will hold all the tiles for current month
  
  return (
    <div style={{ padding: 24 }}>
      <h1>Focus Flare</h1>
      <div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="number" min={0.5} value={hours} onChange={e => setHours(Number(e.target.value))} />
        <button onClick={addSession}>Add Session</button>
      </div>
      <ul>
        {sessions.map(s => {
          let d = new Date(s.date);
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const yy = String(d.getFullYear()).slice(-2);
          const formattedDate = `${mm}/${dd}/${yy}`;
          return (<li key={s.id}>{formattedDate}: {s.hours} hour(s)</li>);
        })}
      </ul>
      <button className="changeMonth" onClick={goToNextMonth}>Next &gt</button>
      <button className="changeMonth" onClick={goToPrevMonth}>Prev &lt</button>
      <div className="heatmap">
        {tiles}
      </div>
    </div>
  );
}

function getDisplayMonthTiles(displayMonth: number, displayYr: number) {
    const daysInMonth = new Date(displayYr, displayMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(displayYr, displayMonth, 1).getDay();
    //array for ech month will have 6 rows and 7 columns
    let tiles: JSX.Element[][] = [];
    //filling the empty days at the beginning
    for (let i = 0; i < firstDayOfWeek; i++) { 
        tiles[0].push(<div key={`empty-${i}`} className="tile empty"></div>)
    }
    //filling the actual days 
    for (let day = 0; day < daysInMonth; day++) {
        //TODO
    }
    return tiles;
}
export default HeatmapPage;
