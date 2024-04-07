import {ActionIcon, TextInput, Text} from "@mantine/core";
import {useContext, useEffect, useRef, useState} from "react";
import {DataContext} from "@/DataProvider";
import {FaArrowRight} from "react-icons/fa";
import Image from "next/image";
import logo from "../../public/logo.png"

export const UsernamePage = () => {
    const {setUsername} = useContext(DataContext);
    const [localUsername, setLocalUsername] = useState("");
    const userNameInputRef = useRef();

    const onSend = () => {
        setUsername(localUsername);
    }

    useEffect(() => {
        userNameInputRef?.current?.focus();
    }, []);

    return (
        <div style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
            <Image width={300} src={logo} alt="free online planning poker tool scrumbluff logo"/>
            <Text>Free Online Planning Poker Tool</Text>
            <TextInput
                ref={userNameInputRef}
                mt={80}
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSend()
                    }
                }}
                radius="xl"
                size="xl"
                placeholder="Enter your username"
                rightSectionWidth={70}
                rightSection={
                    <ActionIcon onClick={onSend} size={40} radius="xl" variant="filled">
                        <FaArrowRight/>
                    </ActionIcon>
                }
            />
        </div>
    )
}

export default UsernamePage;