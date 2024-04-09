import {
    ActionIcon,
    Alert,
    Button,
    CopyButton,
    SimpleGrid,
    Text,
    TextInput,
    Title,
    Tooltip
} from "@mantine/core";
import React, {Fragment, useContext, useState} from "react";
import {FaCheck, FaCoffee, FaRegCopy, FaRegHourglass} from "react-icons/fa";
import JoinRoomForm from "@/components/JoinRoomForm";
import {DataContext} from "@/DataProvider";
import {APP_URL} from "@/api";
import ClientCard from "@/components/ClientCard";
import CardOption from "@/components/CardOption";
import CommentsCard from "@/components/CommentsCard";
import CompleteTopicModal from "@/components/CompleteTopicModal";


const MainView = () => {
    const {room, toggleVisibility, voteOnTopic, clientId} = useContext(DataContext);
    const roomUrl = room ? `${APP_URL}/?roomId=${room.room_id}` : null;
    const [completeTopic, setCompleteTopic] = useState();
    const availableOptions = [
        {"value": "0.5", render: <Title size={25}>0.5</Title>},
        {"value": "1", render: <Title>1</Title>},
        {"value": "2", render: <Title>2</Title>},
        {"value": "3", render: <Title>3</Title>},
        {"value": "5", render: <Title>5</Title>},
        {"value": "8", render: <Title>8</Title>},
        {"value": "13", render: <Title>13</Title>},
        {"value": "20", render: <Title>20</Title>},
        {"value": "coffee", render: <Title><FaCoffee/></Title>},
        {"value": "no_ans", render: <Title>?</Title>},
    ]

    const _voteOnTopic = (topicId, value) => {
        if(Math.random() > 0.85 && value === "0.5") {
            const sure1 = window.confirm("Are you sure this is only a 0.5??")
            if(!sure1) return;

            const sure2 = window.confirm("No, i mean it, 0.5 is like... very low. Are you sure??")
            if(!sure2) return;

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
        }}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                <div style={{flex: 1}}>
                    <Text size="lg" fw="bold">Now voting:</Text>
                    <Text c="dimmed">{room?.topics?.[room.current_topic_id]?.title || '-'}</Text>
                </div>

                <div style={{
                    flex: 1,
                    visibility: areVotesVisible() ? 'visible' : 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 10,
                    marginTop: 20
                }}>
                    <Text c="dimmed" size="sm">Did you reach a consensus?</Text>
                    <Button onClick={() => setCompleteTopic(room?.current_topic_id)} color="teal">Set points and
                        complete Topic</Button>
                </div>

                <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
                    <Text size="lg" fw="bold">Invite players:</Text>
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
                </div>
            </div>

            {!isVoting() &&
                <Fragment>
                    <Alert variant="light" color="blue" title="No topic selected" icon={<FaRegHourglass size={40}/>}>
                        Waiting for a topic to be selected to start the game.
                    </Alert>
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
                        <Button onClick={() => toggleVisibility(room?.current_topic_id)} size="lg"
                                variant="outline">
                            {areVotesVisible() ? 'Hide cards' : 'Reveal cards'}
                        </Button>

                        <SimpleGrid cols={Object.keys(room?.connected_users).length > 8 ? 6 : 4} mt={70}>
                            {Object.keys(room?.connected_users).map((clientId) => (
                                <ClientCard key={clientId} client={room?.connected_users[clientId]}/>
                            ))}
                        </SimpleGrid>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', gap: 5, marginTop: 50}}>
                        {availableOptions.map((option) => (
                            <CardOption
                                key={option.value}
                                selected={getVote() === option.value}
                                onSelect={() => _voteOnTopic(room.current_topic_id, option.value)}>
                                {option.render}
                            </CardOption>
                        ))}
                    </div>
                    <CommentsCard/>
                </Fragment>
            }

        </div>
    )
}

export default MainView