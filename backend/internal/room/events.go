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
	TopicID     ulid.ULID `json:"topic_id"`
	Title       string    `json:"title" json:"title"`
	Description string    `json:"description" json:"description"`
	CreatedAt   time.Time `json:"created_at" json:"created_at"`
}

type TopicRemovedEvent struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type TopicVotesResetedEvent struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type TopicCompletedEvent struct {
	TopicID ulid.ULID `json:"topic_id"`
	Points  string    `json:"points"`
}

type CurrentTopicChangedEvent struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type CommentAddedEvent struct {
	CommentID ulid.ULID `json:"comment_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type VisibilityToggled struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type Auth struct {
	ClientID ulid.ULID `json:"client_id"`
	Username string    `json:"username"`
	Type     string    `json:"type"`
}
