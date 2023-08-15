import { Canvas, Rect, Selector } from '@shopify/react-native-skia'
import { View, StyleSheet } from 'react-native'
import {
    transformGameSpacePositionToScreenSpacePosition,
    useGameArea,
    useGameAreaScaleFactor,
} from '../utils/gameArea'
import { useCallback, useEffect } from 'react'
import { GameState, UUID } from '../types'
import {
    GAME_AREA_BORDER_WIDTH,
    LINE_STROKE_WIDTH,
    PLAYER_COLORS,
    PLAYER_SIZE,
} from '../utils/constants'
import { GestureDetector } from 'react-native-gesture-handler'
import { useChangeDirectionGesture } from '../utils/useChangeDirectionGesture'
import { Player } from './Player'
import { useServerGameState } from '../utils/serverGameState'
import {
    convertUnitVectorToDegrees,
    convertUnitVectorToRadians,
} from '../utils/geometry'

type Props = {
    userId: UUID
    gameState: GameState
}

export function GameCanvas({ gameState }: Props) {
    const { width: gameAreaWidth, height: gameAreaHeight } = useGameArea()
    const gameAreaScaleFactor = useGameAreaScaleFactor()

    const { gesture, sendDirectionChangeToServerIfNeeded } =
        useChangeDirectionGesture()

    const { playerIds, players } = useServerGameState()

    const uiLoop = useCallback(() => {
        requestAnimationFrame(uiLoop)
        if (gameState === 'waiting') {
            return
        }

        sendDirectionChangeToServerIfNeeded()
    }, [gameState, sendDirectionChangeToServerIfNeeded])

    useEffect(() => {
        requestAnimationFrame(uiLoop)
    }, [uiLoop])

    const renderPlayers = useCallback(() => {
        return playerIds.map((id, index) => {
            const positionX = Selector(players, (p) =>
                p[id]
                    ? transformGameSpacePositionToScreenSpacePosition(
                          p[id],
                          gameAreaScaleFactor
                      ).x -
                      (PLAYER_SIZE - LINE_STROKE_WIDTH) / 2
                    : 0
            )

            const positionY = Selector(players, (p) =>
                p[id]
                    ? transformGameSpacePositionToScreenSpacePosition(
                          p[id],
                          gameAreaScaleFactor
                      ).y -
                      (PLAYER_SIZE - LINE_STROKE_WIDTH) / 2
                    : 0
            )

            const origin = Selector(players, (p) =>
                p[id]
                    ? transformGameSpacePositionToScreenSpacePosition(
                          p[id],
                          gameAreaScaleFactor
                      )
                    : { x: 0, y: 0 }
            )

            const transform = Selector(players, (p) => [
                {
                    rotate: p[id]
                        ? convertUnitVectorToRadians({
                              x: p[id].angleUnitVectorX,
                              y: p[id].angleUnitVectorY,
                          }) +
                          Math.PI / 2
                        : 0,
                },
            ])

            return (
                <Player
                    key={`player_${index}`}
                    x={positionX}
                    y={positionY}
                    origin={origin}
                    color={PLAYER_COLORS[index % PLAYER_COLORS.length]}
                    transform={transform}
                />
            )
        })
    }, [gameAreaScaleFactor, playerIds, players])

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.container}>
                <Canvas
                    style={[
                        styles.canvas,
                        {
                            width: gameAreaWidth + GAME_AREA_BORDER_WIDTH * 2,
                            height: gameAreaHeight + GAME_AREA_BORDER_WIDTH * 2,
                        },
                    ]}
                >
                    <Rect
                        width={gameAreaWidth + GAME_AREA_BORDER_WIDTH * 2}
                        height={gameAreaHeight + GAME_AREA_BORDER_WIDTH * 2}
                        color={'white'}
                        style={'stroke'}
                        strokeWidth={GAME_AREA_BORDER_WIDTH}
                    />
                    {renderPlayers()}
                </Canvas>
            </View>
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    canvas: {
        backgroundColor: '#121f33',
    },
})
