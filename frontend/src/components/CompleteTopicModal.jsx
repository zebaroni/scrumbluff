import {Modal, Select} from "@mantine/core";
import {useContext} from "react";
import {DataContext} from "@/DataProvider";

const CompleteTopicModal = ({topic, setCompleteTopic}) => {
    const {completeTopic} = useContext(DataContext);

    const _onSelect = (topicId, points) => {
        completeTopic(topicId, points)
        setCompleteTopic(false);
    }

    return (
        <Modal
            opened={!!topic}
            onClose={() => setCompleteTopic(false)}
            title="Set points and complete topic"
        >
            <Select
                placeholder="Select the topic final vote"
                mt={20}
                comboboxProps={{zIndex: 999999}}
                size="lg"
                onChange={(_value) => _onSelect(topic, _value)}
                data={[
                    {value: '1', label: '1'},
                    {value: '2', label: '2'},
                    {value: '3', label: '3'},
                    {value: '5', label: '5'},
                    {value: '8', label: '8'},
                    {value: '13', label: '13'},
                    {value: '20', label: '20'},
                    {value: 'coffee', label: '☕'},
                    {value: 'no_ans', label: "?"},
                ]}
            />
        </Modal>
    )
}

export default CompleteTopicModal;