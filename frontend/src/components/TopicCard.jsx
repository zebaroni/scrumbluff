import {ActionIcon, Button, Card, Menu, Select, Text, Title, Tooltip} from "@mantine/core";
import {FaCoffee, FaHashtag, FaRegComment} from "react-icons/fa";
import {useHover} from "@mantine/hooks";
import {Fragment, useContext, useState} from "react";
import {DataContext} from "@/DataProvider";
import {FaEllipsis, FaLink} from "react-icons/fa6";
import CompleteTopicModal from "@/components/CompleteTopicModal";
import CreateTopicModal from "@/components/CreateTopicModal";


const TopicCard = ({topic, onSelect}) => {
    const {room, setVotingTopic, resetTopic, removeTopic} = useContext(DataContext);
    const {hovered, ref} = useHover();
    const [completeTopic, setCompleteTopic] = useState();
    const [editTopic, setEditTopic] = useState();

    const isCompleted = () => {
        return topic?.completed;
    }

    const isVoting = () => {
        return room?.current_topic_id && topic?.topic_id === room?.current_topic_id;
    }

    const getBgColor = () => {
        if (isCompleted()) {
            return '#b2f2bb'
        }

        if (isVoting()) {
            return '#ffd8a8'
        }

        if (hovered) {
            return 'rgba(0,0,0,0.05)'
        }

        return 'white'
    }

    const getButtonText = () => {
        if (isCompleted()) {
            return "Completed"
        }

        if (isVoting()) {
            return "Being voted..."
        }

        return "Start voting"
    }

    const renderPoints = () => {
        if (topic.points === "no_ans") {
            return '?'
        }

        if (topic.points === "coffee") {
            return <FaCoffee/>
        }

        return topic.points;
    }

    const _onSelect = () => {
        onSelect(topic)
    }

    return (
        <Fragment>
            <CreateTopicModal open={!!editTopic} editTopic={editTopic} setOpened={setEditTopic}/>
            <Card onClick={() => _onSelect()} ref={ref} shadow="sm" p="lg" radius="md" withBorder style={{
                backgroundColor: getBgColor(),
                cursor: 'pointer'
            }}>
                <div style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                        <Title size="xs">{topic.title}</Title>
                        {topic.url &&
                            <Tooltip label={topic.url}>
                                <ActionIcon color="gray" variant="subtle" onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(topic.url, '_blank').focus();
                                }}>
                                    <FaLink/>
                                </ActionIcon>
                            </Tooltip>
                        }
                    </div>
                    <Menu withinPortal position="bottom-start" shadow="sm">
                        <Menu.Target>
                            <ActionIcon onClick={(e) => e.stopPropagation()} variant="subtle" color="gray">
                                <FaEllipsis/>
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item onClick={(e) => {
                                e.stopPropagation();
                                setEditTopic(topic)
                            }}>
                                Edit details
                            </Menu.Item>
                            <Menu.Item onClick={(e) => {
                                e.stopPropagation();
                                resetTopic(topic.topic_id)
                            }}>
                                Reset votes
                            </Menu.Item>
                            <Menu.Item
                                color="red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const res = window.confirm("Are you sure you wanna delete this topic?");
                                    if (!res) return;
                                    removeTopic(topic.topic_id)
                                }}
                            >
                                Delete topic
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
                <Text mt={5} size="sm" color="dimmed">
                    {topic.description.length > 0 ? topic.description : 'No description...'}
                </Text>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 20
                }}>
                    <Button disabled={isVoting() || isCompleted()} onClick={(e) => {
                        e.stopPropagation();
                        setVotingTopic(topic.topic_id)
                    }} variant="light" color="blue" fullWidth radius="md" mr={10}>
                        {getButtonText()}
                    </Button>
                    <Tooltip label="Comments">
                        <div style={{display: 'flex', flexDirection: 'row', gap: 3}}>
                            <FaRegComment/>
                            <Text size="xs">{topic?.comments.length}</Text>
                        </div>
                    </Tooltip>
                    <Tooltip label={`Story Points (${topic.points})`}>
                        <div style={{display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center'}}>
                            <FaHashtag/>
                            {isCompleted() ?
                                <Text>{renderPoints()}</Text> :
                                <Select
                                    placeholder="-"
                                    comboboxProps={{zIndex: 999999}}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setCompleteTopic(topic)
                                    }}
                                    size="xs"
                                    w={50}
                                />
                            }
                        </div>
                    </Tooltip>
                </div>
            </Card>
            <CompleteTopicModal topic={completeTopic} setCompleteTopic={setCompleteTopic}/>
        </Fragment>
    )
}

export default TopicCard;