import {
    ImageSVG,
    SkiaMutableValue,
    Selector,
} from '@shopify/react-native-skia'
import { PLAYER_SVG } from '../utils/drawing'
import { Player as PlayerType, UUID } from '../types'
import { transformGameSpacePositionToScreenSpacePosition } from '../utils/gameArea'
import {
    LINE_STROKE_WIDTH,
    PLAYER_COLORS,
    PLAYER_SIZE,
} from '../utils/constants'
import { convertUnitVectorToRadians } from '../utils/geometry'

type Props = {
    players: SkiaMutableValue<Record<UUID, PlayerType>>
    playerId: UUID
    playerIndex: number
    /**
     * Components rendered a skia context can't get use the safe area hook
     */
    gameAreaScaleFactor: number
}

export function Player({
    players,
    playerId,
    playerIndex,
    gameAreaScaleFactor,
}: Props) {
    const y = Selector(players, (p) =>
        p[playerId]
            ? transformGameSpacePositionToScreenSpacePosition(
                  p[playerId],
                  gameAreaScaleFactor
              ).x -
              (PLAYER_SIZE - LINE_STROKE_WIDTH) / 2
            : 0
    )

    const x = Selector(players, (p) =>
        p[playerId]
            ? transformGameSpacePositionToScreenSpacePosition(
                  p[playerId],
                  gameAreaScaleFactor
              ).y -
              (PLAYER_SIZE - LINE_STROKE_WIDTH) / 2
            : 0
    )

    const origin = Selector(players, (p) =>
        p[playerId]
            ? transformGameSpacePositionToScreenSpacePosition(
                  p[playerId],
                  gameAreaScaleFactor
              )
            : { x: 0, y: 0 }
    )

    const transform = Selector(players, (p) => [
        {
            rotate: p[playerId]
                ? convertUnitVectorToRadians({
                      x: p[playerId].angleUnitVectorX,
                      y: p[playerId].angleUnitVectorY,
                  }) +
                  Math.PI / 2
                : 0,
        },
    ])

    return (
        <ImageSVG
            svg={PLAYER_SVG}
            x={y}
            y={x}
            width={PLAYER_SIZE}
            height={PLAYER_SIZE}
            origin={origin}
            transform={transform}
            color={PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]}
        />
    )
}
