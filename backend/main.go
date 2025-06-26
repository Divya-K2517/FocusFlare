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
	"database/sql"
	// "os"
	"github.com/golang-jwt/jwt/v5"
	// "golang.org/x/crypto/bcrypt"
	"net/http"
)

func main() {
	//loading .env first
	if err := godotenv.Load(); err != nil {
		panic("Error loading .env file")
	}

	if err := database.ConnectToDataBase(); err != nil {
        panic("Failed to connect to database: " + err.Error())
    }
	//creating/updating a table to match the FocusSession struct
	database.DB.AutoMigrate(&models.User{}, &models.FocusSession{})
	
	//new router instance
	r := gin.Default()
	fmt.Println(".env loaded, connected to database, new router instance created")

	r.Use(cors.Default())
	
	//method to get all sessions
	//r.GET("/sessions", getSessionsHandler)
	//method to get the monthly totals map
	//r.GET("/monthly-totals", getMonthlyTotalsHandler)
	//method to add a session
	//r.POST("/sessions", addSessionHandler)
	//endpoint for signing up
	r.POST("/signup", signupHandler)
	//endpoint to login
	r.POST("/login", loginHandler)
	r.GET("/validate", validateLoginHandler)
	//method to delete sessions
	//r.DELETE("/sessions/:id", deleteSessionHandler)

	//auth middleware for protected routes
	protected := r.Group("/")
	protected.Use(authMiddleware())
	{
		protected.GET("/sessions", getSessionsHandler)
		protected.GET("/monthly-totals", getMonthlyTotalsHandler)
		protected.POST("/sessions", addSessionHandler)
		protected.DELETE("/sessions/:id", deleteSessionHandler)
	}

	r.Run(":8080")
}

func IsValidDate(date time.Time) bool {
	now := time.Now();
	today := time.Date(now.Year(), now.Month(), now.Day(), int(0),int(0),int(0),int(0), now.Location())
	input := time.Date(date.Year(), date.Month(), date.Day(), int(0),int(0),int(0),int(0), date.Location())

	return today.After(input)
}
func rebuildMonthlyTotals(rows *sql.Rows) map[string]map[string]float32{ //will return a new monthly totals
	monthlyTotals := make(map[string]map[string]float32)
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
		
		_, exists := monthlyTotals[monthString];
		if !exists {
			monthlyTotals[monthString] = make(map[string]float32)
		}
		monthlyTotals[monthString][dayString] = total
	}
	return monthlyTotals
}
//endpoint handler functions
func getSessionsHandler (c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	//c represents the current HTTP request
	fmt.Println("getting all sessions")
	var sessions []models.FocusSession
	//sorting by date, newest first 
	//fills the sessions array
	result := database.DB.Where("user_id = ?", userID).Order("date DESC").Find(&sessions)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to retrieve sessions"})
		return
	}
	c.JSON(200, sessions)
	//will be run when a GET request is sent to /sessions
	//will send back a JSON array of sessions
	//func(c *gin.Context) is the method handler
}
func getMonthlyTotalsHandler (c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	//monthly totals is not a global variable in the backend!
	//instead, anytime the frontend wants to access monthly totals, it will access this endpoint
	//this endpoint dynamically queries the database,
	//calculates monthly totals, and returns is
	//ultimately, this ensures that monthly totals and the heatmap are always up-to-date
	fmt.Println("sending monthly totals to frontend")
	//querying the database for all sessions
	rows, err := database.DB.Model(&models.FocusSession{}).
		Where("user_id = ?", userID).
		//getting the sum of hours per day, grouped by date
		Select(`DATE("date") AS day, SUM(hours) AS total_hours`).
		Group(`DATE("date")`).
		Rows()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to retrieve hours per day from database"})
		return
	}
	defer rows.Close() //letting go of the connection to database
	monthlyTotals := rebuildMonthlyTotals(rows);
	fmt.Println("retrieved monthly totals: ", monthlyTotals)
	c.JSON(200, monthlyTotals)
}
func addSessionHandler (c *gin.Context) {
	userID := c.MustGet("userID").(uint) //getting 
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
		c.JSON(400, gin.H{"error": "No date was entered :("})
		return
	} else if !IsValidDate(incomingSession.Date) {
		c.JSON(400, gin.H{"error": "The date entered is in the future - and thats impossible. Pick one that's passed or today"})
		return
	}
	//initializing a month
	incomingSession.UserID = userID
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
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save session"})
		return
	}

	fmt.Println("month:", incomingSession.Month)
	fmt.Println("session added successfully")
	c.JSON(201, incomingSession)
}
func signupHandler (c *gin.Context){
	var user models.User
	err := c.ShouldBindJSON(&user); //converts the JSON data into a user struct
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid signup request"})
		return
	}
	//hash password
	err = user.HashPassword(user.Password); //scrambling the password before saving
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not hash password"})
		return
	}
	//saving new user to db
	err = database.DB.Create(&user).Error;
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not create user"})
		return
	}
	c.Status(http.StatusCreated)
}
func loginHandler (c *gin.Context){
	var credentials struct {
		Username    string `json:"username"`
		Password string `json:"password"`
	}

	err := c.ShouldBindJSON(&credentials); //converts the JSON data into a credentials struct
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	var user models.User
	//searching for a matching user in the db
	err = database.DB.Where("username = ?", credentials.Username).First(&user).Error;
	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}
	if !user.CheckPassword(credentials.Password) {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}
	//creating JWT token
	//TODO: user is signed in for 24 hrs at a time. figure out what happens when the return to the page after 24 hrs and try to add a session
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AuthClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})
	tokenString, err := token.SignedString(models.JWTSecret) //signs token with secret key
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not generate token"})
		return
	}
	c.JSON(200, gin.H{"token": tokenString})
}
func validateLoginHandler (c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "Missing token"})
		return
	}
	token, err := jwt.ParseWithClaims(tokenString, &models.AuthClaims{}, func(token *jwt.Token) (interface{}, error) {
		//parser calls this function
		//returns the key(jwtSecret) and an error if application 
		return models.JWTSecret, nil 
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "Invalid token"})
		return
	}

	claims, ok := token.Claims.(*models.AuthClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "Invalid token claims"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"valid":   true,
		"user_id": claims.UserID,
		"expires": claims.ExpiresAt.Format(time.RFC3339),
	})
}
func deleteSessionHandler (c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	id := c.Param("id") //session id
	var session models.FocusSession //destination variable for .First()
	//finding the session by id
	err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&session, id).Error
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
	//TODO: remove the session from monthly totals
	c.JSON(200, gin.H{"message": "Session was successfully deleted"})
}
//middleware function
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization token required"})
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, &models.AuthClaims{}, func(token *jwt.Token) (interface{}, error) {
			//parser calls this function
			//returns the key(jwtSecret) and an error if application 
			return models.JWTSecret, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(*models.AuthClaims)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token claims"})
			return
		}

		c.Set("user", claims.UserID)
		c.Next()
	}
}
