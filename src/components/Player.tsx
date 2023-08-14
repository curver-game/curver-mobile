import { Color, ImageSVG } from '@shopify/react-native-skia'
import { Position, transformGameSpaceToScreenSpace } from '../utils/gameArea'
import { PLAYER_SIZE } from '../utils/constants'
import { PLAYER_SVG } from '../utils/drawing'

type Props = {
    index: number
    position: Position
    rotation: any
    color: Color
    origin: any
}

export function Player({ index, position, rotation, color, origin }: Props) {
    return (
        <ImageSVG
            key={`head_${index}`}
            svg={PLAYER_SVG}
            origin={origin}
            x={position.x}
            y={position.y}
            width={PLAYER_SIZE}
            height={PLAYER_SIZE}
            color={color}
            transform={rotation}
        />
    )
}
