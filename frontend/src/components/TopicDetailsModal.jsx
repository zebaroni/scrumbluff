import {ActionIcon, Avatar, Divider, Modal, Text, Textarea} from "@mantine/core";
import {FaArrowRight} from "react-icons/fa";
import {useContext, useState} from "react";
import {DataContext} from "@/DataProvider";

const TopicDetailsModal = ({selectedTopic, setSelectedTopic}) => {
    const {sendComment, room} = useContext(DataContext);
    const [comment, setComment] = useState("");

    const _sendComment = async() => {
        sendComment(selectedTopic?.topic_id, comment)
        setComment("");
    }

    return (
        <Modal
            size="lg"
            opened={!!selectedTopic}
            onClose={() => setSelectedTopic(null)}
            title={selectedTopic?.title}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <Text size="sm" c="dimmed">Description:</Text>
                <Text size="sm">{selectedTopic?.description || '-'}</Text>

                <Text mt={10} size="sm" c="dimmed">URL:</Text>
                <Text size="sm">
                    {selectedTopic?.url ?
                        <a target="_blank" href={selectedTopic.url}>{selectedTopic.url}</a> : '-'}
                </Text>

                <Divider mt={15}/>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)}
                          placeholder="Add your comment" rightSection={
                    <ActionIcon onClick={() => _sendComment()} size={32} mr={20} radius="xl"
                                variant="filled">
                        <FaArrowRight/>
                    </ActionIcon>
                }/>

                {room?.topics[selectedTopic?.topic_id]?.comments
                    .sort((a, b) => b.created_at > a.created_at)
                    .map((comment) => (
                    <div style={{display: 'flex', flexDirection: 'row', gap: 10, marginTop: 20}}>
                        <Avatar/>
                        <div>
                            <Text size="xs" c="dimmed">{new Date(comment.created_at).toLocaleString()}</Text>
                            <Text size="sm">{comment.content}</Text>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    )
}

export default TopicDetailsModal;