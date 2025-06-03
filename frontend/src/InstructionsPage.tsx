import React, { useEffect, useState } from 'react';
import axios from 'axios';


function InstructionsPage() {

    return (
        <div className="App">
            <div className="blurbs-container">

                <div className="blurb corner top-left">
                    <div className="blurb-title">Adding a session</div>
                    <div className="blurb-content">Click on the "Heatmap" tab, enter the date and length of the focus session, and hit "Add".</div>
                </div>

                <div className="blurb corner top-right">    
                    <div className="blurb-title">Track progress</div>
                    <div className="blurb-content">Check out the monthly heatmap for daily streaks, high focus days, and general trends. The darker a day is in color, the more you focused on that date.</div>
                </div>

                <div className="blurb center">
                    <div className="blurb-title">What is Focus Flare?</div>
                    <div className="blurb-content">Your personal productivity tracker! Log your focus sessions, watch your progress grow, and let your motivation spark!</div>
                </div> 

                <div className="blurb corner bottom-left">
                    <div className="blurb-title">Deleting a session</div>
                    <div className="blurb-content">Everyone makes mistakes! Click the "Delete" button next to a session (on the right side of the "Heatmap" page) to delete.</div>
                </div>

                <div className="blurb corner bottom-right">
                    <div className="blurb-title">Privacy first</div>
                    <div className="blurb-content">Privacy matters, always. Your session data stays on your device unless you decide to back it up.</div>
                </div>              
            </div>
        </div>
    );
}

export default InstructionsPage;