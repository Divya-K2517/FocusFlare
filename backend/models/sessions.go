package models

import (
	"time"
	//"gorm.io/gorm"
)

type FocusSession struct {
	ID    uint      `json:"id" gorm:"primaryKey"`
	Date time.Time `json:"date" gorm:"type:date;not null;index"`
	Hours float32 `json:"hours" gorm:"not null;check:hours > 0"`
}

//making the default table name focus_sessions
func (FocusSession) TableName() string {
	return "focus_sessions"
}