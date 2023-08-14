import { Canvas, Rect, Selector } from '@shopify/react-native-skia'
import { View, StyleSheet } from 'react-native'
import { useGameArea, useGameAreaScaleFactor } from '../utils/gameArea'
import { useCallback, useEffect } from 'react'
import { useGame } from '../utils/useGame'
import { GameState, UUID } from '../types'
import { GAME_AREA_BORDER_WIDTH, LINE_STROKE_WIDTH } from '../utils/constants'
import { GestureDetector } from 'react-native-gesture-handler'
import { useChangeDirectionGesture } from '../utils/useChangeDirectionGesture'
import { PlayerTrail } from './PlayerTrail'
import { Player } from './Player'

const possibleColors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta']

type Props = {
    userId: UUID
    gameState: GameState
}

export function GameCanvas({ userId, gameState }: Props) {
    const { width: gameAreaWidth, height: gameAreaHeight } = useGameArea()
    const gameAreaScaleFactor = useGameAreaScaleFactor()

    const { gesture, sendDirectionChangeToServerIfNeeded } =
        useChangeDirectionGesture()

    const {
        updatePaths,
        playerIds,
        playerPathStrings,
        headRotations,
        headPositions,
    } = useGame(userId)

    const uiLoop = () => {
        requestAnimationFrame(uiLoop)

        if (gameState === 'waiting') {
            return
        }

        updatePaths()
        sendDirectionChangeToServerIfNeeded()
    }

    useEffect(() => {
        requestAnimationFrame(uiLoop)
    }, [])

    const renderPlayerPaths = useCallback(() => {
        return playerIds.map((id, index) => {
            const path = Selector(playerPathStrings, (p) => p[id])

            const color = possibleColors[index % possibleColors.length]

            return <PlayerTrail path={path} color={color} />
        })
    })

    const renderPlayers = useCallback(() => {
        return playerIds.map((id, index) => {
            const origin = Selector(headPositions, (p) => {
                return {
                    x: p[id].x,
                    y: p[id].y,
                }
            })
            const headX = Selector(
                headPositions,
                (p) => p[id].x - (HEAD_SIZE / 2 - LINE_STROKE_WIDTH / 2)
            )
            const headY = Selector(
                headPositions,
                (p) => p[id].y - HEAD_SIZE / 2
            )

            const headRotation = Selector(headRotations, (p) => p[id])

            return <Player />
        })
    }, [])

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

                    {renderPlayerPaths()}
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
