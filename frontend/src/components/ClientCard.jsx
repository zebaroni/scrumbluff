import React, {useContext} from "react";
import {Text, Title} from "@mantine/core";
import {DataContext} from "@/DataProvider";
import {GiSpades} from "react-icons/gi";
import {FaCoffee} from "react-icons/fa";
import ReactCardFlip from "react-card-flip";

const ClientCard = ({client}) => {
    const {room} = useContext(DataContext);
    const areVotesVisible = room?.topics?.[room.current_topic_id]?.votes_visible || false;

    const getVote = () => {
        return room?.topics?.[room.current_topic_id]?.client_votes?.[client.user_id];
    }

    const renderVote = () => {
        if (getVote() === "no_ans") {
            return "?";
        }

        if (getVote() === "coffee") {
            return <FaCoffee/>;
        }

        return getVote() || '-';
    }

    const getBgColor = () => {
        if (!areVotesVisible && !getVote()) {
            return 'lightgray'
        }

        if (!areVotesVisible && getVote()) {
            return '#228be6'
        }

        return 'white';
    }

    return (
        <ReactCardFlip isFlipped={areVotesVisible} flipDirection="horizontal">
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: getBgColor(),
                    border: areVotesVisible ? '2px solid #228be6' : 'none',
                    width: 100,
                    height: 130,
                    borderRadius: 10
                }}>
                    <Title color="white"><GiSpades color="white"/></Title>
                </div>
                <Text style={{marginTop: 10}}>
                    {client.name}
                </Text>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: getBgColor(),
                    border: areVotesVisible ? '2px solid #228be6' : 'none',
                    width: 100,
                    height: 130,
                    borderRadius: 10
                }}>
                    <Title color="white">{renderVote()}</Title>
                </div>
                <Text style={{marginTop: 10}}>
                    {client.name}
                </Text>
            </div>
        </ReactCardFlip>
    )
}

export default ClientCard;