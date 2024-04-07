package room

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"
)

type RoomRepoSqlite struct {
	db *sql.DB
}

func NewRoomRepoSqlite(db *sql.DB) RoomRepoSqlite {
	return RoomRepoSqlite{
		db: db,
	}
}

func (r *RoomRepoSqlite) FindRoom(roomId RoomID) (*Room, error) {
	var res []byte
	var room Room

	err := r.db.QueryRow("SELECT data FROM rooms WHERE id = ?", roomId.String()).Scan(&res)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}

		log.Println(err)
		return nil, err
	}

	err = json.Unmarshal(res, &room)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	room.mutex = sync.Mutex{}
	room.BroadcastChan = make(chan interface{})

	return &room, nil
}

func (r *RoomRepoSqlite) Save(room *Room) error {
	data, err := json.Marshal(room)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = r.db.Exec("INSERT OR REPLACE INTO rooms (id, data) VALUES (?, ?)", room.RoomID.String(), data)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}
