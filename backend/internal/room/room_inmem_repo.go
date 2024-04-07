package room

import (
	"sync"
)

type Storage struct {
	Rooms map[RoomID]Room
}

type RoomRepoMemory struct {
	db *Storage

	mu sync.Mutex
}

func NewRoomRepoMemory() RoomRepoMemory {
	return RoomRepoMemory{
		db: &Storage{Rooms: make(map[RoomID]Room)},
		mu: sync.Mutex{},
	}
}

func (r *RoomRepoMemory) FindRoom(roomId RoomID) (*Room, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	room, ok := r.db.Rooms[roomId]
	if !ok {
		return nil, nil
	}

	return &room, nil
}

func (r *RoomRepoMemory) Save(room *Room) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.db.Rooms[room.RoomID] = *room
	return nil
}
