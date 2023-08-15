import { Canvas, Rect } from '@shopify/react-native-skia'
import { View, StyleSheet } from 'react-native'
import { useGameArea, useGameAreaScaleFactor } from '../utils/gameArea'
import { useCallback, useEffect } from 'react'
import { GameState, UUID } from '../types'
import { GAME_AREA_BORDER_WIDTH } from '../utils/constants'
import { GestureDetector } from 'react-native-gesture-handler'
import { useChangeDirectionGesture } from '../utils/useChangeDirectionGesture'
import { Player } from './Player'
import { useServerGameState } from '../utils/serverGameState'
import { PlayerTrail } from './PlayerTrail'

type Props = {
    userId: UUID
    gameState: GameState
}

export function GameCanvas({ gameState }: Props) {
    const { width: gameAreaWidth, height: gameAreaHeight } = useGameArea()
    const gameAreaScaleFactor = useGameAreaScaleFactor()

    const { gesture, sendDirectionChangeToServerIfNeeded } =
        useChangeDirectionGesture()

    const { playerIds, players, paths } = useServerGameState()

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

    const renderPaths = useCallback(() => {
        return playerIds.map((id, index) => {
            return (
                <PlayerTrail
                    key={`trail_${index}`}
                    paths={paths}
                    playerIndex={index}
                    playerId={id}
                    gameAreaScaleFactor={gameAreaScaleFactor}
                />
            )
        })
    }, [gameAreaScaleFactor, paths, playerIds])

    const renderPlayers = useCallback(() => {
        return playerIds.map((id, index) => {
            return (
                <Player
                    key={`player_${index}`}
                    players={players}
                    playerId={id}
                    playerIndex={index}
                    gameAreaScaleFactor={gameAreaScaleFactor}
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
                    {renderPaths()}
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
