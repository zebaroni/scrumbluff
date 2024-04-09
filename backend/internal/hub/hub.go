package hub

import (
	"encoding/json"
	"errors"
	"github.com/gorilla/websocket"
	"github.com/oklog/ulid/v2"
	"log"
	"planning-poker/internal/room"
	"planning-poker/internal/user"
	"reflect"
	"sync"
	"time"
)

type ConnectWSResponse struct {
	Type     string `json:"type"`
	UserID   string `json:"user_id"`
	UserName string `json:"user_name"`
	RoomID   string `json:"room_id"`
}

type FindRoomResponse struct {
	Room           *room.Room  `json:"room"`
	ConnectedUsers []user.User `json:"connected_users"`
}

type IncMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type OutMessage struct {
	Type    string
	Payload interface{}
}

type ActiveRoom struct {
	Room           *room.Room
	ConnectedUsers map[user.UserID]*UserConnection
	CloseChan      chan bool
}

type UserConnection struct {
	User user.User
	Conn *websocket.Conn
	Room *room.Room
}

type Hub struct {
	ActiveRooms map[room.RoomID]*ActiveRoom

	repo room.RoomRepo
	Mu   sync.Mutex
}

func NewHub(roomRepo room.RoomRepo) Hub {
	return Hub{
		ActiveRooms: make(map[room.RoomID]*ActiveRoom),
		repo:        roomRepo,
		Mu:          sync.Mutex{},
	}
}

func (hub *Hub) CreateRoom() (*room.Room, error) {
	r := room.NewRoom(ulid.Make(), make(map[room.TopicID]*room.Topic), time.Now())

	err := hub.repo.Save(&r)
	if err != nil {
		return nil, err
	}

	return &r, nil
}

func (hub *Hub) ConnectToRoom(ws *websocket.Conn, u user.User, roomId room.RoomID) error {
	hub.Mu.Lock()
	defer hub.Mu.Unlock()

	activeRoom, ok := hub.ActiveRooms[roomId]

	// Room is inactive
	if !ok {
		r, err := hub.repo.FindRoom(roomId)

		if r == nil || err != nil {
			return errors.New("room not found")
		}

		activeRoom = &ActiveRoom{
			Room:           r,
			ConnectedUsers: make(map[user.UserID]*UserConnection),
			CloseChan:      make(chan bool),
		}

		hub.ActiveRooms[roomId] = activeRoom

		go hub.HandleRoomBroadcast(activeRoom)
		log.Printf("Room %s enabled after first user", roomId)
	}

	userConn := &UserConnection{
		Conn: ws,
		User: u,
		Room: activeRoom.Room,
	}

	activeRoom.ConnectedUsers[userConn.User.UserID] = userConn

	err := ws.WriteJSON(ConnectWSResponse{
		Type:     "AUTH",
		UserID:   u.UserID.String(),
		UserName: u.Name,
		RoomID:   roomId.String(),
	})

	if err != nil {
		ws.Close()
		return err
	}

	activeRoom.Room.BroadcastEvent(room.UserJoinedRoom{
		UserID:   userConn.User.UserID,
		Username: userConn.User.Name,
	})

	go hub.ListenClientCommands(userConn)

	log.Printf("User %s connected to Room ID: %s\n", userConn.User.Name, roomId.String())

	return nil
}

func (hub *Hub) DisconnectFromRoom(userConn *UserConnection, roomId room.RoomID) {
	hub.Mu.Lock()
	defer hub.Mu.Unlock()

	_, ok := hub.ActiveRooms[roomId]
	if !ok {
		return
	}

	delete(hub.ActiveRooms[roomId].ConnectedUsers, userConn.User.UserID)

	hub.ActiveRooms[roomId].Room.BroadcastEvent(room.UserLeftRoom{UserID: userConn.User.UserID})

	log.Printf("User %s disconnected from Room ID: %s\n", userConn.User.Name, roomId.String())

	// disable room if no connected users left
	if len(hub.ActiveRooms[roomId].ConnectedUsers) == 0 {
		hub.ActiveRooms[roomId].CloseChan <- true
		delete(hub.ActiveRooms, roomId)
		log.Printf("Room %s disabled due to inactivity\n", roomId.String())
	}
}

func (hub *Hub) FindRoom(roomId room.RoomID) (*FindRoomResponse, error) {
	r, err := hub.repo.FindRoom(roomId)
	if err != nil {
		return nil, err
	}

	if r == nil {
		return nil, nil
	}

	// don't know if this is necessary here
	hub.Mu.Lock()
	defer hub.Mu.Unlock()

	var connectedUsers []user.User
	_, ok := hub.ActiveRooms[roomId]
	if ok {
		for _, u := range hub.ActiveRooms[roomId].ConnectedUsers {
			connectedUsers = append(connectedUsers, u.User)
		}
	}

	return &FindRoomResponse{
		Room:           r,
		ConnectedUsers: connectedUsers,
	}, nil
}

// ListenClientCommands is a goroutine running for each connected client
func (hub *Hub) ListenClientCommands(userConn *UserConnection) {
	r := userConn.Room

	defer func() {
		hub.DisconnectFromRoom(userConn, r.RoomID)
	}()

	for {
		var m IncMessage
		err := userConn.Conn.ReadJSON(&m)
		if err != nil {
			return
		}

		switch m.Type {
		case "ADD_TOPIC":
			var cmd AddTopicCommand
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.AddTopic(ulid.Make(), cmd.Title, cmd.URL, cmd.Content)
			}
		case "REMOVE_TOPIC":
			var cmd RemoveTopicCommand
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.RemoveTopic(cmd.TopicID)
			}
		case "COMPLETE_TOPIC":
			var cmd CompleteTopicCommand
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.CompleteTopic(cmd.TopicID, cmd.Points)
			}
		case "RESET_TOPIC":
			var cmd ResetTopicVotesCommand
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.ResetTopic(cmd.TopicID)
			}
		case "VOTE_ON_TOPIC":
			var cmd VoteOnTopicCommand
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.VoteOnTopic(userConn.User.UserID, cmd.TopicID, cmd.Points)
			}
		case "CHANGE_CURRENT_TOPIC":
			var cmd ChangeCurrentTopicCommand
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.SetCurrentTopic(cmd.TopicID)
			}
		case "ADD_COMENT":
			var cmd AddCommentCommand
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.AddComment(ulid.Make(), cmd.TopicID, cmd.Content)
			}
		case "TOGGLE_VISIBILITY":
			var cmd ToggleVisibility
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.ToggleVisibility(cmd.TopicID)
			}
		case "CHANGE_TOPIC_DETAILS":
			var cmd ChangeTopicDetails
			err := json.Unmarshal(m.Data, &cmd)
			if err == nil {
				r.ChangeTopicDetails(cmd.TopicID, cmd.Title, cmd.Desc, cmd.Url)
			}
		}

		err = hub.repo.Save(r)
		if err != nil {
			log.Println(err)
		}
	}
}

// HandleRoomBroadcast is a goroutine for each active room to dispatch messages for every user in the room
func (hub *Hub) HandleRoomBroadcast(activeRoom *ActiveRoom) {
	for {
		select {
		case m := <-activeRoom.Room.BroadcastChan:
			for _, userConn := range activeRoom.ConnectedUsers {
				outM := OutMessage{
					Type:    reflect.TypeOf(m).Name(),
					Payload: m,
				}

				err := userConn.Conn.WriteJSON(outM)
				if err != nil {
					log.Printf("error writing to client: %v", err)
				}
			}
		case <-activeRoom.CloseChan:
			return
		}
	}
}
