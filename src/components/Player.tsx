import { ImageSVG } from '@shopify/react-native-skia'
import { transformGameSpaceToScreenSpace } from '../utils/gameArea'
import { PLAYER_SIZE } from '../utils/constants'
import { PLAYER_SVG } from '../utils/drawing'

export function Player() {
    return (
        <ImageSVG
            key={`head_${index}`}
            svg={PLAYER_SVG}
            origin={origin}
            x={transformGameSpaceToScreenSpace(
                headX.value.current,
                gameAreaScaleFactor
            )}
            y={transformGameSpaceToScreenSpace(
                headY.value.current,
                gameAreaScaleFactor
            )}
            width={PLAYER_SIZE}
            height={PLAYER_SIZE}
            color={possibleColors[index % possibleColors.length]}
            transform={headRotation}
        />
    )
}
