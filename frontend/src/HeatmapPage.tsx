import React, {useEffect, useState} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import { JSX } from 'react/jsx-runtime';
import { useAuth } from "./AuthContext";
import {urls} from './urls';
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

type FocusSession = {
  id: number;
  date: string;
  hours: number;
}
type HeatmapPageProps = { //to receive monthly totals from App.tsx
    monthlyTotals: Map<string, Map<string, number>>;
    setMonthlyTotals: React.Dispatch<React.SetStateAction<Map<string, Map<string, number>>>>;
};

function HeatmapPage({monthlyTotals, setMonthlyTotals}: HeatmapPageProps ) {
  //creating a sessions state variable which is an array of Focus Sessions
  //setSessions will update sessions
  //0.5 is the default amount of hours
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const { currentUser, logout } = useAuth();
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [hours, setHours] = useState(0.5);
  //month/yr that is currently displayed
  //displaydate is an object w/ two properties: month and yr (displayDate.month, displayDate.yr)
  const [displayDate, setDisplayDate] = useState<{ month: number; yr: number }>({month: new Date().getMonth(), yr: new Date().getFullYear()}); 
  //for heatmap and monthly session display
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const navigate = useNavigate(); 

  //makes a get request to the backend to get all the sessions
  //res is the response
  //setSessions will update the sessions with res.data, which is an array of FocusSession objects
  useEffect(() => {
    axios.get(`${BACKEND_URL}/sessions`)
      .then(res => setSessions(res.data));

    axios.get<Map<string, Map<string, number>>>(`${BACKEND_URL}/monthly-totals`)
        .then(res =>  { //need to convert the object into a map bc json from the backend will return a plain object not a map
            const raw = res.data;
            const mapData = new Map<string, Map<string, number>>();
            for (const [monthKey, days] of Object.entries(raw)) {
                const dayMap = new Map<string, number>(Object.entries(days));
                mapData.set(monthKey, dayMap);
            }
            setMonthlyTotals(mapData)
        })
        .catch(err => {
            if (err.response && err.response.status === 401) {
                logout();
                navigate("/login");
            } else {
                console.error("Error fetching monthly totals map: ", err);
            }        
        });
  }, []);

  //uses post to send a new focus session to backend
  //res is the response, will add the new session to the list of sessions and re-render
  const addSession = () => {
    // date object from the input date
    const dateObj = new Date(date);
    // making the display date match the entered date
    setDisplayDate({
        month: dateObj.getMonth(),
        yr: dateObj.getFullYear()
    });
     //making the date into RFC3339 format
     //"YYYY-MM-DDTHH:mm:ss.sssZ"
    const formattedDate = new Date(dateObj).toISOString(); 
    //sending to backend
    axios.post(`${BACKEND_URL}/sessions`, { date: formattedDate, hours })
      .then(res => {
        setSessions([...sessions, res.data]);
        // getting the updated monthly totals from backend 
        return axios.get<Map<string, Map<string, number>>>(`${BACKEND_URL}/monthly-totals`);
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
      .catch(error => {
        if (error.response && error.response.status === 401) {
            logout();
            navigate("/login");
        } else {
            window.alert(error.response.data.error);
        }
      });
  };
  console.log("current sessions: ", sessions);
  
  //change month handlers
  const goToPrevMonth = () => {
    setDisplayDate(prev => {
        if (prev.month === 0) { //if the month is janurary then prev = 0
            return {month: 11, yr: prev.yr - 1}; //11 = december
        }
        return {month: prev.month - 1, yr: prev.yr};
    });
  };
  const goToNextMonth = () => {
    setDisplayDate(prev => {
        if (prev.month === 11) { //if the month is december then prev = 11
            return {month: 0, yr: prev.yr + 1}; //0 = january
        }
        return {month: prev.month + 1, yr: prev.yr};
    });
  }
  const tiles = getDisplayMonthTiles(displayDate.month, displayDate.yr, monthlyTotals)//will hold all the tiles for current month
  
  
  
  //past sessions stuff
   //creating a sessions state variable which is an array of Focus Sessions
   //NOTNEEDED RN: const [sessions, setSessions] = useState<FocusSession[]>([]);
   //calls fetchSessions when the component loads
   useEffect(() => {
       fetchSessions();
   }, []);

   const fetchSessions = () => {
       return axios.get(`${BACKEND_URL}/sessions`)
           .then(res => setSessions(res.data))
           .catch(err => {
            if (err.response.status === 401) {
                logout();
                navigate("/login");
            } else {
                console.error("Failed to fetch sessions: ", err);
            }        
            });
       //fetchSessions returns a Promise, ensuring it will finish before the program contintues
   };
   //
   const deleteSession = (id: number) => {
       //when delete session is pressed:
       //1: DELETE request sent to backend to remove session by id
       //2: updated list of sessions is fetched from backend
       //3: updated monthly totals is fetched from backend (monthly totals is recalculated server-side)
       //4: monthly totals object is converted into a map
       //5: monthly totals is updated through setMonthlyTotals
       //6: after setMonthlyTotals() is called, a re-render of any components dependent on monthlyTotals is trigged (since monthly totals is a state variable)
       axios.delete(`${BACKEND_URL}/sessions/${id}`)
           .then(() => fetchSessions())
           .then(() => {
               return axios.get<Map<string, Map<string, number>>>(`${BACKEND_URL}/monthly-totals`);
           })
           .then(res => {
               //need to convert the object into a map bc json from the backend will return a plain object not a map
               const raw = res.data;
               const mapData = new Map<string, Map<string, number>>();
               for (const [monthKey, days] of Object.entries(raw)) {
                   const dayMap = new Map<string, number>(Object.entries(days));
                   mapData.set(monthKey, dayMap);
               }
               console.log("new monthly totals: ", mapData);
               setMonthlyTotals(mapData)
           })
           .catch(err => {
            if (err.response && err.response.status === 401) {
                logout();
                navigate("/login");
            } else {
                console.error("Failed to delete session: ", err);
            }        
            });
   };
  return (
    <div className="App">
        <div style={{ padding: 24 }}>
        <div style = {{ display: 'flex', alignItems: 'flex-start', gap: 32}}>
            {/* focus flare + adding session section  */}
            <div className="heatmap-input">
                <h2>Enter Session</h2>
                <div className="input-row">
                    <div className="input-label-group">
                        <div className="input-label">date</div>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        {/* `${displayDate.yr}-${String(displayDate.month + 1).padStart(2, '0')}-01` */}
                    </div>
                    
                    <div className="input-label-group">
                        <div className="input-label">hrs focused</div>
                        <input type="number" min={0.5} value={hours} step={0.5} onChange={e => setHours(Number(e.target.value))}/>
                    </div>
                    <button onClick={addSession}>Add</button>
                </div>
                {/* heatmap section */}
                <div style={{display: 'grid', justifyContent: 'center',flex: 1}}>
                    <div className="monthNav">
                        <button className="changeMonth" onClick={goToPrevMonth}>&lt;</button>
                        <span>{new Date(displayDate.yr, displayDate.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button className="changeMonth" onClick={goToNextMonth}>&gt;</button>
                    </div>
                    <div className="heatmap">
                        {dayLabels.map(label => (
                            <div key={label} className="tile dayLabel">{label}</div>
                        ))}
                        {tiles}
                    </div>
                </div>
            </div>
                {/* this month's sessions section */}
            <div style={{flex: 1}}>
                <h2>{`${monthNames[displayDate.month]} ${String(displayDate.yr)} Sessions`}</h2>
                    <ul>
                    {getDisplayDateSessions(sessions, deleteSession, displayDate)}
                    </ul>
            </div>
        </div>
        </div>
    </div>
  );
}
function getDisplayMonthTiles(displayMonth: number, displayYr: number, monthlyTotals: Map<string, Map<string, number>>) {
    const daysInMonth = new Date(displayYr, displayMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(displayYr, displayMonth, 1).getDay();
    const noHrsDayColor = 'rgba(244, 185, 206, 1)' //color for days where there are no hours logged
    
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
                const colorIntensity = Math.min((maxHrs > 0 ? (hours / maxHrs) ** 2 : 0) + 0.3, 1);
                const color = `rgba(74, 50, 59, ${colorIntensity})`
                tiles.push( 
                    <div key={day} className="tile" style={{background: color,  color: '#ffffff'}}>
                        {day}
                        <span className="tile-tooltip">
                            {hours} hrs studied
                        </span>
                    </div>);
            } else if (!hours) {
                const hrs = 0;
                tiles.push(
                    <div key={day} className="tile" style={{background: noHrsDayColor}}>
                        {day}
                        <span className="tile-tooltip">
                            {hrs} hrs studied
                        </span>
                    </div>);
            }
        } 
    } else { //if nothing is logged for the map
        for (let day = 1; day < daysInMonth + 1; day++) {
            const hrs = 0;
            //making all the days 
            tiles.push(
                <div key={day} className="tile" style={{background: noHrsDayColor}}>
                    {day}
                    <span className="tile-tooltip">
                            {hrs} hrs studied
                    </span>
                </div>);
        } 
    }
    console.log("tiles: ", tiles);
    return tiles;
}
function getDisplayDateSessions(sessions: FocusSession[], deleteSession: (id:number) => void, displayDate: { month: number; yr: number }) {
    //will return a list of sessions for the currently displayed month
    //filtering all sessions to cut one ones that aren't from the right month
    const displayMonthSessions = sessions.filter(s => {
        const d = new Date(s.date);
        return (
            d.getUTCMonth() === displayDate.month &&
            d.getUTCFullYear() === displayDate.yr
        );
    })
    if (displayMonthSessions.length === 0) { //if array is empty
        return (
            <div className="past-session-content">
                <div>No sessions yet. Stay focused!</div>
            </div>
        );
    }
    //sorting in ascending order(most recent session comes first)
    displayMonthSessions.sort((a, b) => {
        return (new Date(a.date).getTime() - new Date(b.date).getTime());
    })
    //converting each session into a html list item
    return (displayMonthSessions.reverse().map(s => {
        let d = new Date(s.date);
        const dd = String(d.getUTCDate()).padStart(2, '0');
        return (
                <li key={s.id}>
                    <div className="past-session-content">
                        <div className="past-session-content-date">{dd}</div>
                        <div className="past-session-content-hrs">{s.hours} hour(s)</div>
                        <button onClick = {() => {
                            if (handleDelete()) {
                                deleteSession(s.id);
                            }
                        }} className="delete-btn"> 
                            Delete
                        </button>
                    </div>
                </li>
        );
    }));
}
function handleDelete() {
    if (window.confirm("Are you sure you want to delete this session? It will be deleted permanently.")) {
        return true;
    }
    return false;
}
export default HeatmapPage;
