package main
import (
	"net/http"
    "github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
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
	//new router instance
	r := gin.Default()

	r.Use(cors.Default())
	
	//method to get all sessions
	r.GET("/sessions", func(c *gin.Context) {
		c.JSON(http.StatusOK, sessions)
		//will be run when a GET request is sent to /sessions
		//will send back a JSON array of sessions
		//func(c *gin.Context) is the method handler

	})

	//method to add a session
	r.POST("/sessions", func(c *gin.Context) {
		var incomingSession FocusSession
		//NOTES:
		//first populating focusSession with what the client sent
		//assining the client-sent focusSession to err
		//if the err, which the the request sent, is malformed
		//c.BindJSON() will read the JSON body of a request,
		//then decode it into the pointer variable(assign pointer variable to the incoming request),
		// and return an error if one occured
		if err := c.BindJSON(&incomingSession); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		incomingSession.ID = nextID
		nextID++ //incrementing the ID number for next addition
		sessions = append(sessions, incomingSession)
		c.JSON(http.StatusOK, incomingSession)
	})

	r.Run(":8080")
}
