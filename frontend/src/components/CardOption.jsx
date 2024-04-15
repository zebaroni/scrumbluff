import {useHover} from "@mantine/hooks";
import {Title} from "@mantine/core";

const CardOption = ({option, onSelect, selected}) => {
    const {hovered, ref} = useHover();

    return (
        <div ref={ref} onClick={() => onSelect()} style={{
            width: 60,
            height: 85,
            borderRadius: 10,
            border: '2px solid #1c7ed6',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: hovered || selected ? '#e7f5ff' : 'white',
            cursor: 'pointer'
        }}>
            <Title size={10}>
                {option}
            </Title>
        </div>
    )
}

export default CardOption;