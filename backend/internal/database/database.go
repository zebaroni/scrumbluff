package database

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
)

const DB_FILE_PATH = "/scrumbluff_data/scrumbluff.db"

func SetupDatabase() *sql.DB {
	log.Println("Setting up database...")

	db, err := sql.Open("sqlite3", DB_FILE_PATH)
	if err != nil {
		log.Fatal(err)
	}

	// setup tables (this should become migrations in the future)
	log.Println("Setting up tables...")
	_, err = db.Exec(`create table if not exists rooms (id text primary key, data jsonb)`)
	if err != nil {
		log.Fatal(err)
	}

	return db
}
