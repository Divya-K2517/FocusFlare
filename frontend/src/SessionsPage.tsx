import React, { useEffect, useState } from 'react';
import axios from 'axios';

type FocusSession = {
    id: number;
    date: string;
    hours: number;
}
type SessionsPageProps = { //to receive monthly totals from App.tsx
    monthlyTotals: Map<string, Map<string, number>>;
    setMonthlyTotals: React.Dispatch<React.SetStateAction<Map<string, Map<string, number>>>>;
};
function SessionsPage({monthlyTotals, setMonthlyTotals}: SessionsPageProps) {
    //creating a sessions state variable which is an array of Focus Sessions
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    //calls fetchSessions when the component loads
    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = () => {
        return axios.get('http://localhost:8080/sessions')
            .then(res => setSessions(res.data))
            .catch(err => console.error("Failed to fetch sessions:", err));
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
        axios.delete(`http://localhost:8080/sessions/${id}`)
            .then(() => fetchSessions())
            .then(() => {
                return axios.get<Map<string, Map<string, number>>>('http://localhost:8080/monthly-totals');
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
            .catch(err => console.error("Failed to delete session:", err));
    };

    return (
        <div>
            <h2>Past Sessions</h2>
            <ul>
            {sessions.map(s => {
                let d = new Date(s.date);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const yy = String(d.getFullYear()).slice(-2);
                const formattedDate = `${mm}/${dd}/${yy}`;
                return (
                    <li key={s.id}>
                    {formattedDate}: {s.hours} hour(s)
                    <button onClick = {() => deleteSession(s.id)}>Delete</button>
                    </li>
                );
            })}
            </ul>
        </div>
    )
}
export default SessionsPage;