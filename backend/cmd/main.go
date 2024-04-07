package main

import (
	"planning-poker/internal/database"
	"planning-poker/internal/hub"
	"planning-poker/internal/room"
	"planning-poker/internal/server"
)

func main() {
	db := database.SetupDatabase()
	roomRepo := room.NewRoomRepoSqlite(db)
	h := hub.NewHub(&roomRepo)

	s := server.NewServer(&h, &roomRepo)
	s.Serve()
}
