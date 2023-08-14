import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { GameState, MessageToReceive } from '../types'
import { RouteProp, useRoute } from '@react-navigation/native'
import { RootStackProps } from '../navigation'
import { gameWebsocket } from '../api/websocket'
import { useForceUpdate } from '../utils/useForceUpdate'
import { WaitingOverlay } from '../components'
import { GameCanvas } from '../components/GameCanvas'

export let lastTimestamp = 0
export const maxFPS = 60
export const minFrameTime = 1000 / maxFPS

export function GameScreen() {
    const [gameState, setGameState] = useState<GameState>('waiting')
    const [shouldShowReadyButton, setShouldShowReadyButton] = useState(false)
    const forceUpdate = useForceUpdate()

    const {
        params: { roomId, userId },
    } = useRoute<RouteProp<RootStackProps, 'Game'>>()

    const onMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data) as MessageToReceive

        if (message.type === 'update') {
            const updateMessage = message

            setGameState(updateMessage.gameState)

            if (updateMessage.players.length >= 2) {
                setShouldShowReadyButton(true)
            }

            forceUpdate()
        }
    }

    useEffect(() => {
        gameWebsocket.socket?.addEventListener('message', onMessage)

        return () => {
            gameWebsocket.socket?.removeEventListener('message', onMessage)
        }
    }, [])

    return (
        <View style={styles.container}>
            <GameCanvas userId={userId} gameState={gameState} />

            {gameState === 'waiting' && (
                <WaitingOverlay
                    shouldShowReadyButton={shouldShowReadyButton}
                    roomId={roomId}
                    userId={userId}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121f33',
    },
})
