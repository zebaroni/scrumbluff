package main

import (
	"log"
	"planning-poker/internal/config"
	"planning-poker/internal/database"
	"planning-poker/internal/hub"
	"planning-poker/internal/room"
	"planning-poker/internal/server"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	db := database.SetupDatabase(cfg)
	roomRepo := room.NewRoomRepoSqlite(db)
	h := hub.NewHub(&roomRepo)

	s := server.NewServer(cfg, &h, &roomRepo)
	s.Serve()
}
