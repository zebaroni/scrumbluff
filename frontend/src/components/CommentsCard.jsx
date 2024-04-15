import {ActionIcon, Avatar, Badge, Card, Text, Textarea} from "@mantine/core";
import {FaArrowRight, FaChevronDown, FaChevronUp} from "react-icons/fa";
import {Fragment, useContext, useEffect, useRef, useState} from "react";
import {DataContext} from "@/DataProvider";

const CommentsCard = () => {
    const {sendComment, room} = useContext(DataContext);
    const [comment, setComment] = useState("");
    const commentsRef = useRef(undefined);
    const [isHidden, setIsHidden] = useState(false);
    const comments = room?.topics[room?.current_topic_id]?.comments;

    const _sendComment = async () => {
        sendComment(room?.current_topic_id, comment)
        setComment("");
    }

    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current?.scrollIntoView({behavior: 'smooth'})
        }
    }, [room, isHidden])

    return (
        <Card
            w={340} shadow="xl"
            radius="md"
            withBorder={true}
            style={{
                position: 'fixed',
                right: 10,
                bottom: 0,
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column'
            }}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <Text w="bold">Comments</Text>
                    {comments.length > 0 && isHidden ?
                        <Badge t={-5} color="red" ml={2} circle>{comments.length}</Badge> :
                        null
                    }
                </div>

                {isHidden ?
                    <FaChevronUp cursor="pointer" onClick={() => setIsHidden(false)}/> :
                    <FaChevronDown cursor="pointer" onClick={() => setIsHidden(true)}/>
                }
            </div>

            {!isHidden &&
                <Fragment>
                    <div style={{maxHeight: 500, overflowY: 'auto', marginTop: 10}}>
                        {comments
                            .sort((a, b) => b.created_at < a.created_at)
                            .map((comment) => (
                                <div style={{display: 'flex', flexDirection: 'row', gap: 10, marginTop: 20}}>
                                    <Avatar/>
                                    <div>
                                        <Text size="xs"
                                              c="dimmed">{new Date(comment.created_at).toLocaleString()}</Text>
                                        <Text size="sm">{comment.content}</Text>
                                    </div>
                                    <div ref={commentsRef}/>
                                </div>
                            ))}
                    </div>
                    <Textarea
                        mt={20}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.keyCode === 13 && !e.shiftKey) {
                                e.preventDefault();
                                _sendComment()
                            }
                        }}
                        placeholder="Add your comment"
                        rightSection={
                            <ActionIcon onClick={() => _sendComment()} size={32} mr={20} radius="xl"
                                        variant="filled">
                                <FaArrowRight/>
                            </ActionIcon>
                        }
                    />
                </Fragment>
            }
        </Card>
    )
}

export default CommentsCard;