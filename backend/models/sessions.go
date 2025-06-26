package models

import (
	"time"
	"os"
	"github.com/golang-jwt/jwt/v5"
	//"gorm.io/gorm"
)

type FocusSession struct {
	ID    uint      `json:"id" gorm:"primaryKey"`
	Date time.Time `json:"date" gorm:"type:date;not null;index"`
	Hours float32 `json:"hours" gorm:"not null;check:hours > 0"`
	//Intensity int `json:"intensity"`
	Month string `json:"month" gorm:"index"`
}

//making the default table name focus_sessions
func (FocusSession) TableName() string {
	return "focus_sessions"
}
//to keep track of the total hours per day 
type DailyTotal struct {
	Date time.Time 
	TotalHours float32
}

var JWTSecret = []byte(os.Getenv("JWT_SECRET"))
type AuthClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}