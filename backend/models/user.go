package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique;not null"`
	Password string `json:"password" gorm:"not null"`
	Sessions []FocusSession `json:"-" gorm:"foreignKey:UserID"`
}
//when first creating password
func (u *User) HashPassword(password string) error {
	//converts password to byte slice
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	
	if err != nil {
		return err
	}
	u.Password = string(bytes) //storing password
	return nil
}
//to check if password is correct
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}