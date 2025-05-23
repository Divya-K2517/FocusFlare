package models

import (
	"time"
	"gorm.io/gorm"
)

type FocusSession struct {
	gorm.Model
	Date time.Time `gorm:"type:date;not null;index"`
	Hours float `gorm:"not null;check:hours > 0"`
}

//making the default table name focus_sessions
func (FocusSession) TableName() string {
	return "focus_sessions"
}