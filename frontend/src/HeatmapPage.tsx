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
  //getting monthly totals map
  const [monthlyTotals, setMonthlyTotals] = useState<Map<string, Map<string, number>>>(new Map());
  
  //makes a get request to the backend to get all the sessions
  //res is the response
  //setSessions will update the sessions with res.data, which is an array of FocusSession objects
  useEffect(() => {
    axios.get('http://localhost:8080/sessions')
      .then(res => setSessions(res.data));

    axios.get<Map<string, Map<string, number>>>('http://localhost:8080/monthly-totals')
        .then(res =>  { //need to convert the object into a map bc json from the backend will return a plain object not a map
            const raw = res.data;
            const mapData = new Map<string, Map<string, number>>();
            for (const [monthKey, days] of Object.entries(raw)) {
                const dayMap = new Map<string, number>(Object.entries(days));
                mapData.set(monthKey, dayMap);
            }
            setMonthlyTotals(mapData)
        })
        .catch(err => console.error("Error fetching monthly totals map: ", err))
  }, []);

  //uses post to send a new focus session to backend
  //res is the response, will add the new session to the list of sessions and re-render
  const addSession = () => {
     //making the date into RFC3339 format
     //"YYYY-MM-DDTHH:mm:ss.sssZ"
    const formattedDate = new Date(date).toISOString(); 
    //sending to backend
    axios.post('http://localhost:8080/sessions', { date: formattedDate, hours })
      .then(res => {
        setSessions([...sessions, res.data]);
        // getting the updated monthly totals from backend 
        return axios.get<Map<string, Map<string, number>>>('http://localhost:8080/monthly-totals');
      })
      .then(res => { 
        //resetting monthly totals
        //every time a session is added, monthly totals will be reset
        const raw = res.data;
        const mapData = new Map<string, Map<string, number>>();
        for (const [monthKey, days] of Object.entries(raw)) {
            const dayMap = new Map<string, number>(Object.entries(days));
            mapData.set(monthKey, dayMap);
        }
        setMonthlyTotals(mapData)
      })
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

  const tiles = getDisplayMonthTiles(displayMonth, displayYr, monthlyTotals)//will hold all the tiles for current month
  
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
      <button className="changeMonth" onClick={goToPrevMonth}>&lt;</button>
      <span>{new Date(displayYr, displayMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
      <button className="changeMonth" onClick={goToNextMonth}>&gt;</button>
      <div className="heatmap">
        {/* TODO: add day labels above the columns */}
        {tiles}
      </div>
    </div>
  );
}

function getDisplayMonthTiles(displayMonth: number, displayYr: number, monthlyTotals: Map<string, Map<string, number>>) {
    const daysInMonth = new Date(displayYr, displayMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(displayYr, displayMonth, 1).getDay();
    const noHrsDayColor = `rgba(100, 100, 100)` //color for days where there are no hours logged
    //array for ech month will have 6 rows and 7 columns
    let tiles: JSX.Element[] = [];
    //filling the empty days at the beginning
    for (let i = 0; i < firstDayOfWeek; i++) { 
        tiles.push(<div key={`empty-${i}`} className="tile empty"></div>)
    }

    //filling the actual days of the month 
    const monthMap = monthlyTotals.get(`${displayYr}-${String(displayMonth + 1).padStart(2,'0')}`); //extracting the map for that month
    //finding the max amount of focused hours in that month
    let maxHrs = 0;
    if (monthMap) { //incase the month doesn't exist
        for (const value of monthMap.values()) {
            if (value > maxHrs) maxHrs = value;
        }
        for (let day = 1; day < daysInMonth + 1; day++) {
            //TODO
            const hours = monthMap.get(String(day)); //hours focused that day
            if (hours) { //incase the specific day has no hours logged, hours will be undefined
                const colorIntensity = maxHrs > 0 ? hours / maxHrs : 0;
                const color = `rgba(255, 0, 0, ${colorIntensity})`;
                tiles.push(<div key={day} className="tile" style={{background: color}}>{day}</div>);
            } else if (!hours) {
                tiles.push(<div key={day} className="tile" style={{background: noHrsDayColor}}>{day}</div>);
            }
        } 
    } else { //if nothing is logged for the map
        for (let day = 1; day < daysInMonth + 1; day++) {
            //making all the days 
            tiles.push(<div key={day} className="tile" style={{background: noHrsDayColor}}>{day}</div>);
        } 
    }
    console.log("tiles: ", tiles);
    return tiles;
}
export default HeatmapPage;
