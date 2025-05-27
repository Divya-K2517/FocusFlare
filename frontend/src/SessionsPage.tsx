import React, { useEffect, useState } from 'react';
import axios from 'axios';

type FocusSession = {
    id: number;
    date: string;
    hours: number;
}

function SessionsPage() {
    //creating a sessions state variable which is an array of Focus Sessions
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    //calls fetchSessions when the component loads
    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = () => {
        axios.get('http://localhost:8080/sessions').then(res => setSessions(res.data))
            .catch(err => console.error("Failed to fetch sessions:", err));
    };

    const deleteSession = (id: number) => {
        axios.delete(`http://localhost:8080/sessions/${id}`).then(() => fetchSessions())
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