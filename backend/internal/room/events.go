package room

import (
	"github.com/oklog/ulid/v2"
	"time"
)

type UserJoinedRoom struct {
	UserID   ulid.ULID `json:"client_id"`
	Username string    `json:"username"`
}

type UserLeftRoom struct {
	UserID ulid.ULID `json:"client_id"`
}

type UserVotedEvent struct {
	UserID ulid.ULID `json:"user_id"`
}

type TopicAddedEvent struct {
	TopicID     TopicID   `json:"topic_id"`
	Title       string    `json:"title" json:"title"`
	Description string    `json:"description" json:"description"`
	CreatedAt   time.Time `json:"created_at" json:"created_at"`
}

type TopicRemovedEvent struct {
	TopicID TopicID `json:"topic_id"`
}

type TopicVotesResetedEvent struct {
	TopicID TopicID `json:"topic_id"`
}

type TopicCompletedEvent struct {
	TopicID TopicID `json:"topic_id"`
	Points  string  `json:"points"`
}

type TopicUpdatedEvent struct {
	TopicID TopicID `json:"topic_id"`
	Title   string  `json:"title"`
	Desc    string  `json:"desc"`
	Url     string  `json:"url"`
}

type CurrentTopicChangedEvent struct {
	TopicID TopicID `json:"topic_id"`
}

type CommentAddedEvent struct {
	CommentID CommentID `json:"comment_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type VisibilityToggled struct {
	TopicID TopicID `json:"topic_id"`
}

type Auth struct {
	ClientID ulid.ULID `json:"client_id"`
	Username string    `json:"username"`
	Type     string    `json:"type"`
}
