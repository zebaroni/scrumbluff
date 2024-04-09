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
	Points       *string              `json:"points"`
	Completed    bool                 `json:"completed"`
	VotesVisible bool                 `json:"votes_visible"`
	CreatedAt    time.Time            `json:"created_at"`
	CompletedAt  *time.Time           `json:"completed_at"`
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
		BroadcastChan:  make(chan interface{}, 500),
		CreatedAt:      createdAt,
	}
}

func (r *Room) AddTopic(topicId TopicID, title string, url string, desc string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic := Topic{
		TopicID:      topicId,
		Title:        title,
		Url:          url,
		Description:  desc,
		Comments:     make([]Comment, 0),
		ClientVotes:  make(map[ulid.ULID]string),
		Completed:    false,
		Points:       nil,
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

func (r *Room) RemoveTopic(topicId TopicID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if r.CurrentTopicID != nil && (*r.CurrentTopicID == topicId) {
		r.CurrentTopicID = nil
	}

	delete(r.Topics, topicId)

	r.BroadcastEvent(TopicRemovedEvent{TopicID: topicId})
}

func (r *Room) CompleteTopic(topicId TopicID, points string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]

	if !ok {
		return
	}

	t := time.Now()
	topic.CompletedAt = &t
	topic.Completed = true
	topic.Points = &points

	if r.CurrentTopicID != nil && *r.CurrentTopicID == topic.TopicID {
		r.CurrentTopicID = nil
	}

	r.BroadcastEvent(TopicCompletedEvent{
		TopicID: topicId,
		Points:  points,
	})
}

func (r *Room) ResetTopic(topicId TopicID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.Points = nil
	topic.Completed = false
	topic.CompletedAt = nil
	topic.ClientVotes = make(map[ulid.ULID]string)

	r.BroadcastEvent(TopicVotesResetedEvent{TopicID: topicId})
}

func (r *Room) VoteOnTopic(userId ulid.ULID, topicId TopicID, points string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.ClientVotes[userId] = points

	r.BroadcastEvent(UserVotedEvent{UserID: userId})
}

func (r *Room) SetCurrentTopic(topicId TopicID) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.VotesVisible = false
	r.CurrentTopicID = &topicId

	r.BroadcastEvent(CurrentTopicChangedEvent{TopicID: topicId})
}

func (r *Room) AddComment(commentId CommentID, topicId TopicID, content string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	comment := Comment{
		CommentID: commentId,
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

func (r *Room) ToggleVisibility(topicId TopicID) {
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

func (r *Room) ChangeTopicDetails(topicId TopicID, title string, desc string, url string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	topic, ok := r.Topics[topicId]
	if !ok {
		return
	}

	topic.Title = title
	topic.Description = desc
	topic.Url = url

	r.BroadcastEvent(TopicUpdatedEvent{
		TopicID: topicId,
		Title:   title,
		Desc:    desc,
		Url:     url,
	})
}

func (r *Room) BroadcastEvent(event interface{}) {
	r.BroadcastChan <- event
}
