import {
    Group,
    Path,
    Selector,
    Shadow,
    SkiaMutableValue,
} from '@shopify/react-native-skia'
import { LINE_STROKE_WIDTH, PLAYER_COLORS } from '../utils/constants'
import {
    Position,
    transformGameSpacePositionToScreenSpacePosition,
} from '../utils/gameArea'
import { UUID } from '../types'

type Props = {
    paths: SkiaMutableValue<Record<UUID, Position[]>>
    playerId: UUID
    playerIndex: number
    /**
     * Components rendered a skia context can't get use the safe area hook
     */
    gameAreaScaleFactor: number
}

export function PlayerTrail({
    paths,
    playerId,
    playerIndex,
    gameAreaScaleFactor,
}: Props) {
    const path = Selector(paths, (p) =>
        p[playerId]
            ? p[playerId].reduce(
                  (acc, currentPosition) =>
                      `${acc} L ${
                          transformGameSpacePositionToScreenSpacePosition(
                              currentPosition,
                              gameAreaScaleFactor
                          ).x
                      } ${
                          transformGameSpacePositionToScreenSpacePosition(
                              currentPosition,
                              gameAreaScaleFactor
                          ).y
                      }`,
                  `M ${
                      transformGameSpacePositionToScreenSpacePosition(
                          p[playerId][0],
                          gameAreaScaleFactor
                      ).x
                  } ${
                      transformGameSpacePositionToScreenSpacePosition(
                          p[playerId][0],
                          gameAreaScaleFactor
                      ).y
                  }`
              )
            : ''
    )

    return (
        <Group>
            <Path
                path={path}
                color={PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]}
                strokeWidth={LINE_STROKE_WIDTH}
                style="stroke"
            >
                <Shadow
                    dx={0}
                    dy={0}
                    color={PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]}
                    blur={10}
                />
            </Path>
        </Group>
    )
}
