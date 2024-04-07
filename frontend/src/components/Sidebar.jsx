import {Button, NavLink, Text, Title} from "@mantine/core";
import {FaDoorOpen, FaPlus} from "react-icons/fa";
import {useContext, useState} from "react";
import {DataContext} from "@/DataProvider";
import TopicCard from "@/components/TopicCard";
import CreateTopicModal from "@/components/CreateTopicModal";
import TopicDetailsModal from "@/components/TopicDetailsModal";

const Sidebar = () => {
    const {recentRooms, room, joinRoom} = useContext(DataContext);
    const [createOpened, setCreateOpened] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);

    const openRecentRoom = (roomId) => {
        joinRoom(roomId)
    }

    if (!room) {
        return (
            <div>
                <Text size="lg">Your recent rooms:</Text>
                {Object.keys(recentRooms).length > 0 ?
                    <div style={{marginTop: 10}}>
                        {Object.keys(recentRooms)
                            .sort((a, b) => recentRooms[a].created_at < recentRooms[b].created_at)
                            .slice(0, 10)
                            .map((roomId) => (
                                <NavLink onClick={() => openRecentRoom(roomId)} key={roomId}
                                         label={new Date(recentRooms[roomId].created_at).toLocaleString()}
                                         leftSection={<FaDoorOpen/>}/>
                            ))}
                    </div>
                    :
                    <Text c="dimmed">No recent rooms</Text>
                }
            </div>
        )
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', paddingBottom: 20}}>
            <Title size="sm">Topics:</Title>
            <div style={{width: '100%', marginTop: 20}}>
                <Button onClick={() => setCreateOpened(true)} w="100%" variant="outline" rightSection={<FaPlus/>}>
                    Create New Topic
                </Button>
            </div>
            <div style={{display: 'flex', flexDirection: "column", gap: 10, marginTop: 20}}>
                {Object.keys(room.topics).length > 0 && Object.keys(room.topics).map((topic) => (
                    <TopicCard key={topic} onSelect={(topic) => setSelectedTopic(topic)} topic={room.topics[topic]}/>
                ))}
            </div>
            <CreateTopicModal open={createOpened} setOpened={setCreateOpened}/>
            <TopicDetailsModal selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}/>
        </div>
    )
}

export default Sidebar;