import React, { useEffect, useState } from 'react';
import axios from 'axios';


function InstructionsPage() {

    return (
        <div className="App">
            <div className="blurbs-container">

                <div className="blurb">
                    <div className="blurb-title">What is Focus Flare?</div>
                    <div className="blurb-content">Your personal productivity tracker! Log your focus sessions, watch your progress grow, and let your motivation spark!</div>
                </div>  

                <div className="blurb">
                    <div className="blurb-title">Adding a session</div>
                    <div className="blurb-content">Click on the "Heatmap" tab, enter the date and length of the focus session, and hit "Add".</div>
                </div>

                <div className="blurb">    
                    <div className="blurb-title">Track progress</div>
                    <div className="blurb-content">Absoluely - check out the monthly heatmap on the heatmap page to see daily streaks, high focus days, and general trends. The darker a day is in color, the more you focused on that date.</div>
                </div>

                <div className="blurb">
                    <div className="blurb-title">Deleting a session</div>
                    <div className="blurb-content">Everyone makes mistakes! All sessions for current month are on the right side of the "Heatmap" page. Click the "Delete" button next to each session to delete.</div>
                </div>

                <div className="blurb">
                    <div className="blurb-title">Privacy first</div>
                    <div className="blurb-content">Privacy matters, always. Your session data stays on your device unless you decide to back it up.</div>
                </div>
                    {/* <div className="blurb-title"></div>
                    <div className="blurb-content"></div> */}

                
            </div>
        </div>
    );
}

export default InstructionsPage;