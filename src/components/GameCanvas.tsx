import { Canvas, Rect, Selector } from '@shopify/react-native-skia'
import { View, StyleSheet } from 'react-native'
import { useGameArea } from '../utils/gameArea'
import { useCallback, useEffect } from 'react'
import { useGame } from '../utils/useGame'
import { GameState, UUID } from '../types'
import {
    GAME_AREA_BORDER_WIDTH,
    LINE_STROKE_WIDTH,
    PLAYER_SIZE,
} from '../utils/constants'
import { GestureDetector } from 'react-native-gesture-handler'
import { useChangeDirectionGesture } from '../utils/useChangeDirectionGesture'
import { PlayerTrail } from './PlayerTrail'
import { Player } from './Player'

const possibleColors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta']

type Props = {
    userId: UUID
    gameState: GameState
}

export function GameCanvas({ gameState }: Props) {
    const { width: gameAreaWidth, height: gameAreaHeight } = useGameArea()

    const { gesture, sendDirectionChangeToServerIfNeeded } =
        useChangeDirectionGesture()

    const { playerIds, playerPathStrings, playerRotations, players } = useGame()

    const uiLoop = () => {
        requestAnimationFrame(uiLoop)

        if (gameState === 'waiting') {
            return
        }

        sendDirectionChangeToServerIfNeeded()
    }

    useEffect(() => {
        requestAnimationFrame(uiLoop)
    }, [])

    const renderPlayerPaths = useCallback(() => {
        return playerIds.map((playerId, index) => {
            const pathString = Selector(playerPathStrings, (p) => p[playerId])

            const color = possibleColors[index % possibleColors.length]

            return <PlayerTrail index={index} path={pathString} color={color} />
        })
    }, [playerIds, playerPathStrings])

    const renderPlayers = useCallback(() => {
        return playerIds.map((id, index) => {
            const playerPosition = Selector(players, (p) => ({
                x: p[id].x - (PLAYER_SIZE / 2 - LINE_STROKE_WIDTH / 2),
                y: p[id].y - PLAYER_SIZE / 2,
            }))

            const playerRotationOrigin = Selector(players, (p) => ({
                x: p[id].x,
                y: p[id].y,
            }))

            const playerRotation = Selector(playerRotations, (p) => p[id])

            return (
                <Player
                    index={index}
                    position={playerPosition}
                    rotation={playerRotation}
                    color={possibleColors[index % possibleColors.length]}
                    origin={playerRotationOrigin}
                />
            )
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
