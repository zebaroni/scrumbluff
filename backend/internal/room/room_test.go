package room

import (
	"github.com/oklog/ulid/v2"
	"testing"
	"time"
)

func TestShouldAddTopic(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")

	if len(room.Topics) != 1 {
		t.Error("Wrong number of topics created")
	}

	if _, ok := room.Topics[topicId]; !ok {
		t.Error("Topic not found")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(TopicAddedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldRemoveTopic(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	room.CurrentTopicID = &topicId
	room.RemoveTopic(topicId)

	if _, ok := room.Topics[topicId]; ok {
		t.Error("Topic still exists")
	}

	if room.CurrentTopicID != nil {
		t.Error("Didn't reset selected topic")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(TopicRemovedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldCompleteTopic(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	room.CurrentTopicID = &topicId
	room.CompleteTopic(topicId, "5")

	topic := room.Topics[topicId]

	if topic.Completed == false || topic.CompletedAt == nil || topic.Points == nil {
		t.Error("Didn't complete the topic")
	}

	if room.CurrentTopicID != nil {
		t.Error("Didn't reset selected topic")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(TopicCompletedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldResetTopic(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	room.VoteOnTopic(ulid.Make(), topicId, "5")
	_ = <-room.BroadcastChan // discard UserVotedEvent
	room.VoteOnTopic(ulid.Make(), topicId, "5")
	_ = <-room.BroadcastChan // discard UserVotedEvent
	room.CompleteTopic(topicId, "5")
	_ = <-room.BroadcastChan // discard TopicCompletedEvent

	room.ResetTopic(topicId)

	topic := room.Topics[topicId]

	if topic.Completed || topic.CompletedAt != nil || topic.Points != nil || len(topic.ClientVotes) != 0 {
		t.Error("Topic not reseted correctly")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(TopicVotesResetedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldVoteOnTopic(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	userId := ulid.Make()
	room.VoteOnTopic(userId, topicId, "5")

	topic := room.Topics[topicId]

	vote, ok := topic.ClientVotes[userId]

	if !ok {
		t.Error("User vote not registered")
	}

	if vote != "5" {
		t.Error("Wrong vote registered")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(UserVotedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldSetCurrentTopic(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	room.SetCurrentTopic(topicId)

	if *room.CurrentTopicID != topicId {
		t.Error("Topic was not set as current")
	}

	if room.Topics[topicId].VotesVisible {
		t.Error("Didn't hide the votes")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(CurrentTopicChangedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldAddComment(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	commentId := ulid.Make()
	room.AddComment(commentId, topicId, "somethingsomething")

	if len(room.Topics[topicId].Comments) == 0 {
		t.Error("Comment not added")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(CommentAddedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldToggleVisibility(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	room.AddTopic(topicId, "Test topic", "https://google.com", "test desc")
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	topic := room.Topics[topicId]

	room.ToggleVisibility(topicId)

	if topic.VotesVisible == false {
		t.Error("Didn't toggle the votes visibility")
	}

	room.ToggleVisibility(topicId)

	if topic.VotesVisible == true {
		t.Error("Didn't toggle the votes visibility")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(VisibilityToggled); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}

func TestShouldChangeTopicDetails(t *testing.T) {
	room := NewRoom(ulid.Make(), make(map[TopicID]*Topic), time.Now())
	topicId := ulid.Make()
	title := "Test Topic"
	url := "http://google.com"
	desc := "test desc"
	room.AddTopic(topicId, title, url, desc)
	_ = <-room.BroadcastChan // discard TopicCreatedEvent

	topic := room.Topics[topicId]

	room.ChangeTopicDetails(topicId, "new title", "new desc", "http://facebook.com")

	if topic.Title == title || topic.Description == desc || topic.Url == url {
		t.Error("Topic details didn't update")
	}

	select {
	case ev := <-room.BroadcastChan:
		if _, ok := ev.(TopicUpdatedEvent); !ok {
			t.Error("Wrong event dispatched")
		}
	default:
		t.Error("Event no dispatched")
	}
}
