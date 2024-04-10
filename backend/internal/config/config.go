package config

import (
	"github.com/joho/godotenv"
	"log"
	"os"
)

type AppConfig struct {
	DatabaseFilePath string
	AdminPassword    string
}

func LoadConfig() (AppConfig, error) {
	// Only tries to load the .env file when not running inside fly.io
	if os.Getenv("FLY_MACHINE_ID") == "" {
		log.Println("Loading env variables...")

		err := godotenv.Load()
		if err != nil {
			return AppConfig{}, err
		}
	}

	return AppConfig{
		DatabaseFilePath: os.Getenv("DATABASE_FILE_PATH"),
		AdminPassword:    os.Getenv("ADMIN_PASSWORD"),
	}, nil
}
