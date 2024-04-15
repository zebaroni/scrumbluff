import {
    ActionIcon,
    Alert,
    Box,
    Button,
    CopyButton,
    Flex, Indicator,
    SimpleGrid,
    Text,
    TextInput,
    Title,
    Tooltip
} from "@mantine/core";
import React, {Fragment, useContext, useState} from "react";
import {FaCheck, FaCoffee, FaRegCopy, FaRegHourglass, FaUser} from "react-icons/fa";
import JoinRoomForm from "@/components/JoinRoomForm";
import {DataContext} from "@/DataProvider";
import {APP_URL} from "@/api";
import ClientCard from "@/components/ClientCard";
import CardOption from "@/components/CardOption";
import CommentsCard from "@/components/CommentsCard";
import CompleteTopicModal from "@/components/CompleteTopicModal";
import {FaLink} from "react-icons/fa6";


const MainView = () => {
    const {room, toggleVisibility, voteOnTopic, clientId} = useContext(DataContext);
    const roomUrl = room ? `${APP_URL}/?roomId=${room.room_id}` : null;
    const [completeTopic, setCompleteTopic] = useState();
    const availableOptions = [
        {"value": "0.5", render: <Title size={23}>0.5</Title>},
        {"value": "1", render: <Title size={28}>1</Title>},
        {"value": "2", render: <Title size={28}>2</Title>},
        {"value": "3", render: <Title size={28}>3</Title>},
        {"value": "5", render: <Title size={28}>5</Title>},
        {"value": "8", render: <Title size={28}>8</Title>},
        {"value": "13", render: <Title size={28}>13</Title>},
        {"value": "20", render: <Title size={28}>20</Title>},
        {"value": "coffee", render: <Title size={28}><FaCoffee/></Title>},
        {"value": "no_ans", render: <Title size={28}>?</Title>},
    ]

    const _voteOnTopic = (topicId, value) => {
        if (Math.random() > 0.85 && value === "0.5") {
            const sure1 = window.confirm("Are you sure this is only a 0.5??")
            if (!sure1) return;

            const sure2 = window.confirm("No, i mean it, 0.5 is like... very low. Are you sure??")
            if (!sure2) return;

            window.alert("Alright then...")
        }

        voteOnTopic(topicId, value)
    }

    const areVotesVisible = () => {
        return room?.topics?.[room.current_topic_id]?.votes_visible || false;
    }

    const isVoting = () => {
        return !!room?.current_topic_id;
    }

    const getVote = () => {
        return room?.topics?.[room.current_topic_id]?.client_votes?.[clientId];
    }

    if (!room) {
        return <JoinRoomForm/>
    }

    return (
        <div style={{
            minHeight: '80dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'column',
            paddingRight: 40,
            paddingLeft: 20,
            marginBottom: 60
        }}>
            <Flex
                w="100%"
                justify="flex-start"
                align={{base: 'flex-start'}}
                direction={{base: 'column', md: 'row'}}
                gap={15}
            >
                <div style={{flex: 1}}>
                    <Text size="md" fw="bold">
                        Now voting:
                        {room?.topics?.[room.current_topic_id]?.url &&
                            <Tooltip label={room?.topics?.[room.current_topic_id]?.url}>
                                <ActionIcon color="gray" variant="subtle" onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(room?.topics?.[room.current_topic_id]?.url, '_blank').focus();
                                }}>
                                    <FaLink/>
                                </ActionIcon>
                            </Tooltip>
                        }
                    </Text>
                    <Text size="sm" c="dimmed">{room?.topics?.[room.current_topic_id]?.title || '-'}</Text>
                </div>

                <Flex flex={1} align={{base: 'flex-start', md: 'flex-end'}} direction="column">
                    <Text size="md" fw="bold">Invite players:</Text>
                    <TextInput
                        w={250}
                        value={roomUrl}
                        readOnly
                        radius="md"
                        size="sm"
                        mt={5}
                        rightSectionWidth={42}
                        rightSection={
                            <CopyButton value={roomUrl} timeout={2000}>
                                {({copied, copy}) => (
                                    <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                                            {copied ? (
                                                <FaCheck/>
                                            ) : (
                                                <FaRegCopy/>
                                            )}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                        }
                    />
                </Flex>
            </Flex>

            {!isVoting() &&
                <Fragment>
                    <Alert mt={20} variant="light" color="blue" title="No topic selected" icon={<FaRegHourglass size={40}/>}>
                        Waiting for a topic to be selected to start the game.
                    </Alert>
                    <div>
                        <Text mt={20} ta="center">Players waiting:</Text>
                        <SimpleGrid cols={{
                            base: 3,
                            md: Object.keys(room?.connected_users).length > 8 ? 6 : 4
                        }} mt={30}>
                            {Object.keys(room?.connected_users).map((clientId) => (
                                <ClientCard key={clientId} client={room?.connected_users[clientId]}/>
                            ))}
                        </SimpleGrid>
                    </div>
                    <div></div>
                </Fragment>
            }

            {isVoting() &&
                <Fragment>
                    <CompleteTopicModal topic={completeTopic} setCompleteTopic={setCompleteTopic}/>
                    <div style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            flex: 1,
                            visibility: areVotesVisible() ? 'visible' : 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            gap: 10,
                            marginTop: 30
                        }}>
                            <Button w={180} size="md" onClick={() => setCompleteTopic(room?.current_topic_id)} color="teal">Complete Topic</Button>
                        </div>

                        <Button mt={5} w={180} onClick={() => toggleVisibility(room?.current_topic_id)} size="md"
                                variant="outline">
                            {areVotesVisible() ? 'Hide cards' : 'Reveal cards'}
                        </Button>

                        <SimpleGrid cols={{
                            base: 3,
                            md: Object.keys(room?.connected_users).length > 8 ? 6 : 4
                        }} mt={70}>
                            {Object.keys(room?.connected_users).map((clientId) => (
                                <ClientCard key={clientId} client={room?.connected_users[clientId]}/>
                            ))}
                        </SimpleGrid>
                    </div>
                    <SimpleGrid spacing={3} mt={50} cols={{
                        base: 6,
                        md: 8,
                        lg: 10
                    }}>
                        {availableOptions.map((option) => (
                            <CardOption
                                key={option.value}
                                selected={getVote() === option.value}
                                option={option.render}
                                onSelect={() => _voteOnTopic(room.current_topic_id, option.value)}/>
                        ))}
                    </SimpleGrid>
                    <CommentsCard/>
                </Fragment>
            }

        </div>
    )
}

export default MainView