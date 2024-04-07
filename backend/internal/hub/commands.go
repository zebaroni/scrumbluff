package hub

import "github.com/oklog/ulid/v2"

type AddTopicCommand struct {
	Title   string `json:"title"`
	URL     string `json:"url"`
	Content string `json:"content"`
}

type RemoveTopicCommand struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type CompleteTopicCommand struct {
	TopicID ulid.ULID `json:"topic_id"`
	Points  string    `json:"points"`
}

type ResetTopicVotesCommand struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type VoteOnTopicCommand struct {
	TopicID ulid.ULID `json:"topic_id"`
	Points  string    `json:"points"`
}

type ChangeCurrentTopicCommand struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type AddCommentCommand struct {
	TopicID ulid.ULID `json:"topic_id"`
	Content string    `json:"content"`
}

type ToggleVisibility struct {
	TopicID ulid.ULID `json:"topic_id"`
}

type ChangeTopicDetails struct {
	TopicID ulid.ULID `json:"topic_id"`
	Title   string    `json:"title"`
	Desc    string    `json:"desc"`
	Url     string    `json:"url"`
}
