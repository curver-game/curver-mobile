import {
    ImageSVG,
    SkiaMutableValue,
    Selector,
} from '@shopify/react-native-skia'
import { PLAYER_SVG } from '../utils/drawing'
import { Player as PlayerType, UUID } from '../types'
import { gmToSc } from '../utils/gameArea'
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
    const x = Selector(players, (p) =>
        p[playerId]
            ? gmToSc(p[playerId], gameAreaScaleFactor).x - PLAYER_SIZE / 2
            : 0
    )

    const y = Selector(players, (p) =>
        p[playerId]
            ? gmToSc(p[playerId], gameAreaScaleFactor).y - PLAYER_SIZE / 2
            : 0
    )

    const origin = Selector(players, (p) => {
        const originUntransformed = p[playerId]
            ? gmToSc(p[playerId], gameAreaScaleFactor)
            : { x: 0, y: 0 }

        return {
            x: originUntransformed.x,
            y: originUntransformed.y,
        }
    })

    const transform = Selector(players, (p) => [
        {
            rotate: p[playerId]
                ? convertUnitVectorToRadians({
                      x: p[playerId].angleUnitVectorX,
                      y: p[playerId].angleUnitVectorY,
                  }) +
                  Math.PI / 2 // The player SVG is pointing up, but we want it to point right for cartesian coordinates.
                : 0,
        },
    ])

    return (
        <ImageSVG
            svg={PLAYER_SVG}
            x={x}
            y={y}
            width={PLAYER_SIZE}
            height={PLAYER_SIZE}
            origin={origin}
            transform={transform}
            color={PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]}
        />
    )
}
