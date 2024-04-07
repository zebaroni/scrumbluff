import {ActionIcon, Button, Text, TextInput, Title} from "@mantine/core";
import {FaArrowRight, FaDoorOpen} from "react-icons/fa";
import {useContext, useState} from "react";
import {DataContext} from "@/DataProvider";

const JoinRoomForm = () => {
    const [roomId, setRoomId] = useState("");
    const {joinRoom, createRoom} = useContext(DataContext);

    return (
        <div style={{
            display: 'flex',
            height: '80dvh',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: "column",
        }}>
            <div style={{display: 'flex', flexDirection: 'row', gap: 10}}>
                <FaDoorOpen size={40}/>
                <Title> Join a Room:</Title>
            </div>
            <div style={{width: 500, marginTop: 20}}>
                <TextInput
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            joinRoom(roomId)
                        }
                    }}
                    radius="xl"
                    size="lg"
                    autoFocus={true}
                    placeholder="Enter the Room ID"
                    rightSectionWidth={42}
                    rightSection={
                        <ActionIcon onClick={() => joinRoom(roomId)} size={32} radius="xl" variant="filled">
                            <FaArrowRight/>
                        </ActionIcon>
                    }
                />
            </div>
            <Text my={20} opacity={0.4}>or</Text>
            <div>
                <Button radius="xl" onClick={createRoom} size="lg">Create a new Room</Button>
            </div>
        </div>
    )
}

export default JoinRoomForm;