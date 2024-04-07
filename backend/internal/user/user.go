package user

import "github.com/oklog/ulid/v2"

type UserID = ulid.ULID
type User struct {
	UserID UserID
	Name   string
}

func NewUser(id ulid.ULID, name string) User {
	return User{
		UserID: id,
		Name:   name,
	}
}
