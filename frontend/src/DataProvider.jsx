import {createContext, useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {LoadingOverlay} from "@mantine/core";
import {api, WEBSOCKET_URL} from "@/api";

export const DataContext = createContext();

const DataProvider = ({children}) => {
    const router = useRouter();
    const [room, setRoom] = useState(null);
    const [username, _setUsername] = useState("");
    const [clientId, setClientId] = useState("");
    const [recentRooms, setRecentRooms] = useState({});
    const [loading, setLoading] = useState(false);
    const ws = useRef(null);

    const joinRoom = async (roomId) => {
        setLoading(true);

        try {
            const res = await api.get(`/room/${roomId}`);
            const data = res?.data;

            if (!data) {
                throw new Error("not found");
            }

            await router.push(`/?roomId=${data.room_id}`);
        } catch (e) {
            alert("Room not found");
        } finally {
            setLoading(false);
        }
    }

    const createRoom = async () => {
        setLoading(true);

        try {
            const res = await api.post('/room');
            const data = res?.data;

            await router.push(`/?roomId=${data.room_id}`);
        } catch (e) {
            alert("Failure when creating new room")
        } finally {
            setLoading(false)
        }
    }

    const refreshRoom = async () => {
        if (!room) return;

        const res = await api.get(`/room/${room.room_id}`);
        const data = res?.data;
        setRoom(data);
    }

    const createTopic = async (title, desc, url) => {
        if (!ws.current) return;

        ws.current.send(JSON.stringify({
            "type": "ADD_TOPIC",
            "data": {
                "title": title,
                "url": url,
                "content": desc
            }
        }))
    }

    const updateTopic = async (topicId, title, desc, url) => {
        if (!ws.current) return;

        ws.current.send(JSON.stringify({
            "type": "CHANGE_TOPIC_DETAILS",
            "data": {
                "topic_id": topicId,
                "title": title,
                "url": url,
                "desc": desc
            }
        }))
    }

    const setVotingTopic = async (topicId) => {
        if (!ws.current) return;

        ws.current.send(JSON.stringify({
            "type": "CHANGE_CURRENT_TOPIC",
            "data": {
                "topic_id": topicId,
            }
        }))
    }

    const sendComment = async (topicId, comment) => {
        if (!ws.current) return;

        if (comment.trim().length === 0) {
            return;
        }

        ws.current.send(JSON.stringify({
            "type": "ADD_COMENT",
            "data": {
                "topic_id": topicId,
                "content": comment
            }
        }))
    }

    const toggleVisibility = async (topicId) => {
        if (!ws.current) return;

        ws.current.send(JSON.stringify({
            "type": "TOGGLE_VISIBILITY",
            "data": {
                "topic_id": topicId,
            }
        }))
    }

    const voteOnTopic = async (topicId, points) => {
        if (!ws.current) return;

        ws.current.send(JSON.stringify({
            "type": "VOTE_ON_TOPIC",
            "data": {
                "topic_id": topicId,
                "points": points,
            }
        }))
    }

    const completeTopic = async (topicId, points) => {
        if (!ws.current) return;

        if (!points.length) {
            return;
        }

        ws.current.send(JSON.stringify({
            "type": "COMPLETE_TOPIC",
            "data": {
                "topic_id": topicId,
                "points": points,
            }
        }))
    }

    const resetTopic = (topicId) => {
        if (!ws.current) return;

        return ws.current.send(JSON.stringify({
            "type": "RESET_TOPIC",
            "data": {
                "topic_id": topicId,
            }
        }))
    }

    const removeTopic = (topicId) => {
        if (!ws.current) return;

        return ws.current.send(JSON.stringify({
            "type": "REMOVE_TOPIC",
            "data": {
                "topic_id": topicId,
            }
        }))
    }


    const _setRoom = async () => {
        const roomId = router?.query?.roomId;

        if (!roomId) {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }

            setRoom(null);
            return;
        }

        try {
            const res = await api.get(`/room/${roomId}`);
            const data = res.data;

            if (!data) {
                throw new Error("room not found");
            }

            setRoom(data);
            await _saveRecentRoom(data);
        } catch (e) {
            alert("Room not found");
            await router.push("/");
        }
    }

    const setUsername = (username) => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }

        localStorage.setItem("username", username)
        _setUsername(username);
    }

    const _setInitalUsername = async () => {
        const username = localStorage.getItem("username");
        _setUsername(username);
    }

    const _setRecentRooms = async () => {
        const recentRooms = localStorage.getItem("recent_rooms");
        if (!recentRooms) {
            return;
        }
        setRecentRooms(JSON.parse(recentRooms));
    }

    const _saveRecentRoom = async (room) => {
        const newRecentRooms = {...recentRooms, [room.room_id]: room};
        setRecentRooms(newRecentRooms);
        localStorage.setItem("recent_rooms", JSON.stringify(newRecentRooms));
    }

    // setup websocket
    useEffect(() => {
        (async () => {
            if (!username || !room) {
                return;
            }

            if (ws.current) {
                return;
            }

            const websocket = new WebSocket(`${WEBSOCKET_URL}/ws/${room.room_id}?username=${username}`);

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data?.type === "AUTH") {
                    setClientId(data?.user_id);
                    return
                }

                refreshRoom();
            }

            websocket.onclose = (event) => {
                console.log("CloseEvent: ", event);
            }

            websocket.onerror = (event) => {
                console.log("Error: ", event);
            }

            setLoading(true);
            await new Promise((res, rej) => {
                websocket.onopen = (e) => {
                    res(true)
                }
            })
            setLoading(false);

            ws.current = websocket;
        })();
    }, [username, room])

    // setup initial state
    useEffect(() => {
        (async () => {
            setLoading(true);
            await _setRoom();
            await _setInitalUsername();
            setLoading(false);
        })();
    }, [router])

    useEffect(() => {
        _setRecentRooms();
    }, []);

    return (
        <DataContext.Provider value={{
            room,
            username,
            setUsername,
            joinRoom,
            createRoom,
            recentRooms,
            createTopic,
            setVotingTopic,
            sendComment,
            clientId,
            toggleVisibility,
            voteOnTopic,
            completeTopic,
            resetTopic,
            removeTopic,
            updateTopic
        }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{radius: "sm", blur: 2}}/>
            {children}
        </DataContext.Provider>
    )
}

export default DataProvider;