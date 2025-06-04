# Focus Flare
<img src="./demos/Screenshot 2025-06-03 at 9.06.29 PM.png" width="400"/> <img src="./demos/Screenshot 2025-06-03 at 9.06.36 PM.png" width="400"/>

🔥 [Click here for some demos](https://drive.google.com/drive/folders/1ii_c266jMLDhEJFAn-TVAjHxv_HefTDq?usp=drive_link)

**💫 Description:**  
Focus Flare is a personal productivity tracker that helps you log focus sessions and visualize your progress. Use the heatmap to celebrate your accomplishments, see top-focus days at a glance, and motivate your self to keep a streak going!

**🚀 Technologies Used:**  
Go, PostgreSQL, React, Typescript, Docker, HTML/CSS

**📊 Features**
* <ins>Heatmap algorithim:</ins> Visualize productivity streaks, high-focus days, and monthly progress at a glance. Made possible using a nonlinear opactity scale for dramatic color differences.
* <ins>Session Logging:</ins> Quickly add or remove sessions
* <ins>Responsive UI:</ins> Watch your progress updated in real time - every move you make is instantly reflected using React state management and seamlessy integrated into the database. 
* <ins>Containerized Deployment:</ins> Run anywhere with Docker; no manual setup required.

**🐳 Run with Docker**
1. Clone the repo (enter the lines below into your terminal)
   - git clone [https://github.com/Divya-K2517/FocusFlare.git](https://github.com/Divya-K2517/FocusFlare.git)
   - cd FocusFlare
   - docker build -t focus-flare .
   - docker run -p 8090:80 focus-flare
2. Open [http://localhost:8090](http://localhost:8090) in your browser.
   
**💻 Run locally:**
1. Install dependencies for the frontend (enter the lines below into your terminal)
   - cd frontend
   - npm install
   - npm start
2. Install and run the backend server (enter the lines below into your terminal)
   - cd backend
   - go run main.go
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

🙌 Acknowledgements
* Inspired by GitHub’s contribution heatmap!


