package server

import (
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/oklog/ulid/v2"
	"net/http"
	"os"
	"planning-poker/internal/config"
	"planning-poker/internal/hub"
	"planning-poker/internal/room"
	"planning-poker/internal/user"
	"runtime"
	"time"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Server struct {
	cfg      config.AppConfig
	Hub      *hub.Hub
	RoomRepo room.RoomRepo
}

func NewServer(cfg config.AppConfig, hub *hub.Hub, roomRepo room.RoomRepo) Server {
	return Server{
		cfg:      cfg,
		Hub:      hub,
		RoomRepo: roomRepo,
	}
}

func (s *Server) Serve() {
	e := echo.New()
	e.Use(middleware.CORS())
	e.Use(middleware.Recover())

	e.GET("/ws/:roomId", s.ConnectWS)
	e.POST("/room", s.CreateRoomHandler)
	e.GET("/room/:id", s.GetRoomHandler)

	e.GET("/metrics", s.GetMetrics)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	e.Logger.Fatal(e.Start(":" + port))
}

func (s *Server) ConnectWS(c echo.Context) error {
	roomId := c.Param("roomId")
	username := c.QueryParam("username")

	if roomId == "" || username == "" {
		return c.JSON(http.StatusBadRequest, nil)
	}

	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	roomUlid, err := ulid.Parse(roomId)
	if err != nil {
		return err
	}

	userId := ulid.Make()
	u := user.NewUser(userId, username)

	err = s.Hub.ConnectToRoom(ws, u, roomUlid)
	if err != nil {
		return err
	}

	return nil
}

func (s *Server) GetRoomHandler(c echo.Context) error {
	type UserResponse struct {
		UserID user.UserID `json:"user_id"`
		Name   string      `json:"name"`
	}
	type CommentResponse struct {
		CommentID room.CommentID `json:"comment_id"`
		Content   string         `json:"content"`
		CreatedAt time.Time      `json:"created_at"`
	}
	type TopicResponse struct {
		TopicID      room.TopicID           `json:"topic_id"`
		Title        string                 `json:"title"`
		Url          string                 `json:"url"`
		Description  string                 `json:"description"`
		Completed    bool                   `json:"completed"`
		VotesVisible bool                   `json:"votes_visible"`
		Points       *string                `json:"points"`
		ClientVotes  map[user.UserID]string `json:"client_votes"`
		Comments     []CommentResponse      `json:"comments"`
	}
	type GetRoomResponse struct {
		RoomID         room.RoomID                    `json:"room_id"`
		CreatedAt      time.Time                      `json:"created_at"`
		Topics         map[room.TopicID]TopicResponse `json:"topics"`
		CurrentTopicID *room.TopicID                  `json:"current_topic_id"`
		ConnectedUsers map[user.UserID]UserResponse   `json:"connected_users"`
	}

	id := c.Param("id")
	roomId, err := ulid.Parse(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, nil)
	}

	r, err := s.Hub.FindRoom(roomId)
	if err != nil {
		return err
	}

	if r == nil {
		return c.JSON(http.StatusNotFound, nil)
	}

	// parse topics
	topics := make(map[room.TopicID]TopicResponse)
	for topicId, topic := range r.Room.Topics {
		comments := make([]CommentResponse, 0)
		for _, comment := range topic.Comments {
			comments = append(comments, CommentResponse{
				CommentID: comment.CommentID,
				Content:   comment.Content,
				CreatedAt: comment.CreatedAt,
			})
		}

		topics[topicId] = TopicResponse{
			TopicID:      topicId,
			Title:        topic.Title,
			Url:          topic.Url,
			Description:  topic.Description,
			Completed:    topic.Completed,
			VotesVisible: topic.VotesVisible,
			Points:       topic.Points,
			ClientVotes:  topic.ClientVotes,
			Comments:     comments,
		}
	}

	// parse connected users
	connUsers := make(map[user.UserID]UserResponse)
	for _, connUser := range r.ConnectedUsers {
		connUsers[connUser.UserID] = UserResponse{
			UserID: connUser.UserID,
			Name:   connUser.Name,
		}
	}

	json := GetRoomResponse{
		RoomID:         r.Room.RoomID,
		CreatedAt:      r.Room.CreatedAt,
		CurrentTopicID: r.Room.CurrentTopicID,
		Topics:         topics,
		ConnectedUsers: connUsers,
	}

	return c.JSON(200, json)
}

func (s *Server) CreateRoomHandler(c echo.Context) error {
	type CreateRoomResponse struct {
		RoomID    room.RoomID `json:"room_id"`
		CreatedAt time.Time   `json:"created_at"`
	}

	r, err := s.Hub.CreateRoom()
	if err != nil {
		return err
	}

	return c.JSON(200, CreateRoomResponse{
		RoomID:    r.RoomID,
		CreatedAt: r.CreatedAt,
	})
}

func (s *Server) GetMetrics(c echo.Context) error {
	type MetricsResponse struct {
		ConnectedRooms    int                 `json:"connected_rooms"`
		ConnectedUsers    int                 `json:"connected_users"`
		CurrentGoroutines int                 `json:"current_goroutines"`
		Details           map[string][]string `json:"details"`
	}

	if c.QueryParam("pw") != s.cfg.AdminPassword {
		return c.JSON(http.StatusUnauthorized, "admin password required")
	}

	res := MetricsResponse{
		ConnectedRooms:    0,
		ConnectedUsers:    0,
		CurrentGoroutines: runtime.NumGoroutine(),
		Details:           make(map[string][]string),
	}

	s.Hub.Mu.Lock()
	defer s.Hub.Mu.Unlock()

	for _, activeRoom := range s.Hub.ActiveRooms {
		res.ConnectedRooms++
		res.Details[activeRoom.Room.RoomID.String()] = []string{}

		for _, user := range activeRoom.ConnectedUsers {
			res.ConnectedUsers++
			res.Details[activeRoom.Room.RoomID.String()] = append(res.Details[activeRoom.Room.RoomID.String()], user.User.Name)
		}
	}

	return c.JSON(http.StatusOK, res)
}
