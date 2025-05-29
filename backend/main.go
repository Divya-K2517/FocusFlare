package main

import (
    "github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
	"gorm.io/gorm" 
	"backend/database" 
	"backend/models"
	"fmt"
	"time"
	"log"
)
//FocusSession structure(like a class in Java)
// type FocusSession struct {
// 	ID int `json:"id"`
// 	Date string `json:"date"`
// 	Hours float32 `json:"hours"`
// }

//dict to track total hours per day
// e.g., "2025-05" -> { "2025-05-26": 3.5, "2025-05-27": 2.0 }
var monthlyTotals = make(map[string]map[string]float32)

func main() {
	//loading .env first
	if err := godotenv.Load(); err != nil {
		panic("Error loading .env file")
	}

	if err := database.ConnectToDataBase(); err != nil {
        panic("Failed to connect to database: " + err.Error())
    }
	//creating/updating a table to match the FocusSession struct
	database.DB.AutoMigrate(&models.FocusSession{})
	
	//new router instance
	r := gin.Default()
	fmt.Println(".env loaded, connected to database, new router instance created")

	r.Use(cors.Default())
	
	//method to get all sessions
	r.GET("/sessions", func(c *gin.Context) {
		//c represents the current HTTP request
		fmt.Println("getting all sessions")
		var sessions []models.FocusSession
		//sorting by date, newest first 
		//fills the sessions array
		result := database.DB.Order("date DESC").Find(&sessions)

		if result.Error != nil {
			c.JSON(500, gin.H{"error": "Failed to retrieve sessions"})
			return
		}
		c.JSON(200, sessions)
		//will be run when a GET request is sent to /sessions
		//will send back a JSON array of sessions
		//func(c *gin.Context) is the method handler
	})
	//method to get the monthly totals map
	r.GET("/monthly-totals", func(c *gin.Context) {
		fmt.Println("sending monthly totals to frontend")
		c.JSON(200, monthlyTotals)
	})
	//method to add a session
	r.POST("/sessions", func(c *gin.Context) {
		fmt.Println("adding a session")
		var incomingSession models.FocusSession
		//NOTES:
		//first populating focusSession with what the client sent
		//assining the client-sent focusSession to err
		//if the err, which the the request sent, is malformed
		//c.BindJSON() will read the JSON body of a request,
		//then decode it into the pointer variable(assign pointer variable to the incoming request),
		// and return an error if one occured
		err := c.BindJSON(&incomingSession);
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		if incomingSession.Date.IsZero() {
			c.JSON(400, gin.H{"error": "Date is required"})
			return
		} else if !IsValidDate(incomingSession.Date) {
			c.JSON(400, gin.H{"error": "Date needs to be on or before today"})
			return
		}
		//initializing a month
		incomingSession.Month = incomingSession.Date.Month().String()

		//using a transaction
		//tx *gorm.DB passes a new *gorm.DB instance called tx into the func
		//tx is like a temp database
		err = database.DB.Transaction(func(tx *gorm.DB) error {
			err := tx.Create(&incomingSession).Error;
			if err != nil {
				return err
			}
			return nil
		}) 

		//adding session to total for the day
		//getting the sum of hours per day from the data base
		rows, err := database.DB.Model(&models.FocusSession{}).
			Select(`DATE("date") AS day, SUM(hours) AS total_hours`).
			Group(`DATE("date")`).
    		Rows()
		if err != nil {
			log.Fatal("error retrieving hours per day from database", err)
		}

		defer rows.Close() //letting go of the connection to database
		for rows.Next() {
			var day time.Time
			var total float32
			//scanning the day and total hours from rows into day and total
			err := rows.Scan(&day, &total); 
			if err != nil {
				log.Fatal("error scanning row: ", err) //will print the error and exit the program
			}

			dayString := fmt.Sprintf("%d", day.Day()) 
			monthString := day.Format("2006-01")
			
			month, exists := monthlyTotals[monthString];
			if !exists {
				monthlyTotals[monthString] = make(map[string]float32)
			}
			monthlyTotals[monthString][dayString] = total

		}

		fmt.Println("monthly totals: ", monthlyTotals)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to save session"})
			return
		}

		fmt.Println("month:", incomingSession.Month)
		fmt.Println("session added successfully")
		c.JSON(201, incomingSession)
	})
	//method to delete sessions
	r.DELETE("/sessions/:id", func(c *gin.Context) {
		id := c.Param("id")
		var session models.FocusSession //destination variable for .First()
		//finding the session by id
		err := database.DB.First(&session, id).Error
		if err != nil {
			c.JSON(404, gin.H{"error": "Session not found"})
			return
		}
		//deleting the session
		err = database.DB.Delete(&session).Error
		if err != nil {
			c.JSON(500, gin.H{"error": "Session was not successfully deleted"})
			return
		}

		c.JSON(200, gin.H{"message": "Session was successfully deleted"})
	})
	r.Run(":8080")
}

func IsValidDate(date time.Time) bool {
	now := time.Now();
	today := time.Date(now.Year(), now.Month(), now.Day(), int(0),int(0),int(0),int(0), now.Location())
	input := time.Date(date.Year(), date.Month(), date.Day(), int(0),int(0),int(0),int(0), date.Location())

	return today.After(input)
}
func calculateIntensity(date time.Time) int {
	//TODO
	return 0
}
