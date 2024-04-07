import {useHover} from "@mantine/hooks";

const CardOption = ({children, onSelect, selected}) => {
    const {hovered, ref} = useHover();

    return (
        <div ref={ref} onClick={() => onSelect()} style={{
            width: 60,
            height: 90,
            borderRadius: 10,
            border: '2px solid #1c7ed6',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: hovered || selected ? '#e7f5ff' : 'white',
            cursor: 'pointer'
        }}>
            {children}
        </div>
    )
}

export default CardOption;