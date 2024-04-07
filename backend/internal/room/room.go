package room

import (
	"github.com/oklog/ulid/v2"
	"sync"
	"time"
)

type RoomRepo interface {
	FindRoom(roomId RoomID) (*Room, error)
	Save(room *Room) error
}

type CommentID = ulid.ULID
type Comment struct {
	CommentID CommentID `json:"comment_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type TopicID = ulid.ULID
type Topic struct {
	TopicID      TopicID              `json:"topic_id"`
	Title        string               `json:"title"`
	Url          string               `json:"url"`
	Description  string               `json:"description"`
	Comments     []Comment            `json:"comments"`
	ClientVotes  map[ulid.ULID]string `json:"client_votes"`
	Points       string               `json:"points"`
	Completed    bool                 `json:"completed"`
	VotesVisible bool                 `json:"votes_visible"`
	CreatedAt    time.Time            `json:"created_at"`
	CompletedAt  time.Time            `json:"completed_at"`
}

type RoomID = ulid.ULID
type Room struct {
	RoomID         RoomID             `json:"room_id"`
	CreatedAt      time.Time          `json:"created_at"`
	Topics         map[TopicID]*Topic `json:"topics"`
	CurrentTopicID *TopicID           `json:"current_topic_id"`
	BroadcastChan  chan interface{}   `json:"-"`
	mutex          sync.Mutex         `json:"-"`
}

func NewRoom(id RoomID, topics map[TopicID]*Topic, createdAt time.Time) Room {
	return Room{
		RoomID:         id,
		Topics:         topics,
		CurrentTopicID: nil,
		BroadcastChan:  make(chan interface{}),
		CreatedAt:      createdAt,
	}
}

func (r *Room) AddTopic(title string, url string, desc string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic := Topic{
		TopicID:      ulid.Make(),
		Title:        title,
		Url:          url,
		Description:  desc,
		Comments:     make([]Comment, 0),
		ClientVotes:  make(map[ulid.ULID]string),
		Completed:    false,
		Points:       "",
		CreatedAt:    time.Now(),
		VotesVisible: false,
	}

	r.Topics[topic.TopicID] = &topic

	r.BroadcastEvent(TopicAddedEvent{
		TopicID:     topic.TopicID,
		Title:       topic.Title,
		Description: topic.Description,
		CreatedAt:   topic.CreatedAt,
	})
}

func (r *Room) RemoveTopic(topicId ulid.ULID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if r.CurrentTopicID != nil && (*r.CurrentTopicID == topicId) {
		r.CurrentTopicID = nil
	}

	delete(r.Topics, topicId)

	r.BroadcastEvent(TopicRemovedEvent{TopicID: topicId})
}

func (r *Room) CompleteTopic(topicId ulid.ULID, points string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]

	if !ok {
		return
	}

	topic.Completed = true
	topic.Points = points
	topic.CompletedAt = time.Now()

	if *r.CurrentTopicID == topic.TopicID {
		r.CurrentTopicID = nil
	}

	r.BroadcastEvent(TopicCompletedEvent{
		TopicID: topicId,
		Points:  points,
	})
}

func (r *Room) ResetTopic(topicId ulid.ULID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.Completed = false
	topic.Points = ""
	topic.ClientVotes = make(map[ulid.ULID]string)

	r.BroadcastEvent(TopicVotesResetedEvent{TopicID: topicId})
}

func (r *Room) VoteOnTopic(userId ulid.ULID, topicId ulid.ULID, points string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.ClientVotes[userId] = points

	r.BroadcastEvent(UserVotedEvent{UserID: userId})
}

func (r *Room) SetCurrentTopic(topicId ulid.ULID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.VotesVisible = false
	r.CurrentTopicID = &topic.TopicID

	r.BroadcastEvent(CurrentTopicChangedEvent{TopicID: topicId})
}

func (r *Room) AddComment(topicId ulid.ULID, content string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	comment := Comment{
		CommentID: ulid.Make(),
		Content:   content,
		CreatedAt: time.Now(),
	}

	topic.Comments = append(topic.Comments, comment)

	r.BroadcastEvent(CommentAddedEvent{
		CommentID: comment.CommentID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
	})
}

func (r *Room) ToggleVisibility(topicId ulid.ULID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.VotesVisible = !topic.VotesVisible

	r.BroadcastEvent(VisibilityToggled{
		TopicID: topicId,
	})
}

func (r *Room) BroadcastEvent(event interface{}) {
	r.BroadcastChan <- event
}
