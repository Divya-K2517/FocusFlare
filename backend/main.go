package main

import (
    "github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
	"gorm.io/gorm" 
	"backend/database" 
	"backend/models"
	"fmt"
)
//FocusSession structure(like a class in Java)
type FocusSession struct {
	ID int `json:"id"`
	Date string `json:"date"`
	Hours float32 `json:"hours"`
}

var sessions = []FocusSession{} //array of sessions
var nextID = 1

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
		}
		//using a transaction
		//tx *gorm.DB passes a new *gorm.DB instance called tx into the func
		//tx is like a temp database
		err := database.DB.Transaction(func(tx *gorm.DB) error {
			err := tx.Create(&incomingSession).Error;
			if err != nil {
				return err
			}
			return nil
		}) 

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to save session"})
			return
		}

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
		err := database.DB.Delate(&session).Error
		if err != nil {
			c.JSON(500, gin.H{"error": "Session was not successfully deleted"})
			return
		}

		c.JSON(200, gin.H{"message": "Session was successfully deleted"})
	})
	r.Run(":8080")
}
