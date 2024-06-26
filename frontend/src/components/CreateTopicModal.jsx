import {Button, Modal, TextInput} from "@mantine/core";
import {useForm} from '@mantine/form';
import {useContext, useEffect} from "react";
import {DataContext} from "@/DataProvider";

const CreateTopicModal = ({open, setOpened, editTopic}) => {
    const {createTopic, updateTopic} = useContext(DataContext);

    const form = useForm({
        initialValues: {
            title: '',
            desc: '',
            url: ''
        },

        validate: {
            title: (value) => value ? null : 'Title required',
        },
    });

    const onSubmit = async (val) => {
        if (editTopic) {
            updateTopic(editTopic.topic_id, val.title, val.desc, val.url)
        } else {
            createTopic(val.title, val.desc, val.url)
        }

        setOpened(false);
        form.reset();
    }

    useEffect(() => {
        if (!editTopic) return;

        form.setValues({
            title: editTopic.title,
            desc: editTopic.description,
            url: editTopic.url,
        })
    }, [editTopic]);

    return (
        <Modal
            opened={open}
            onClose={() => setOpened(false)}
            title={editTopic ? 'Change topic details' : "Create a new topic"}
        >
            <form onSubmit={form.onSubmit(onSubmit)}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                    <TextInput
                        autoFocus={true}
                        placeholder="Write a title for your topic"
                        label="Title"
                        withAsterisk
                        {...form.getInputProps('title')}
                    />
                    <TextInput
                        placeholder="Write a brief description about the topic"
                        label="Description"
                        {...form.getInputProps('desc')}
                    />
                    <TextInput
                        placeholder="Eg: https://company.atlassian.net/browse/TICKET-5616"
                        label="Ticket URL"
                        {...form.getInputProps('url')}
                    />

                    <Button type="submit" w="100%" mt={20}>
                        {editTopic ? 'Change Details' : 'Create Topic'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default CreateTopicModal;