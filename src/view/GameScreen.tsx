import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { GameState } from '../types'
import { RouteProp, useRoute } from '@react-navigation/native'
import { RootStackProps } from '../navigation'
import { WaitingOverlay } from '../components'
import { GameCanvas } from '../components/GameCanvas'
import { useListenToSpecificMessage as useListenToSpecificMessageType } from '../utils/messageListener'

export function GameScreen() {
    const [gameState, setGameState] = useState<GameState>('waiting')
    const [shouldShowReadyButton, setShouldShowReadyButton] = useState(false)

    const {
        params: { roomId, userId },
    } = useRoute<RouteProp<RootStackProps, 'Game'>>()

    useListenToSpecificMessageType(
        (message) => {
            const updateMessage = message

            setGameState(updateMessage.gameState)

            if (updateMessage.players.length >= 2) {
                setShouldShowReadyButton(true)
            }
        },
        [],
        'update'
    )

    useListenToSpecificMessageType((message) => {}, [], 'gameEnded')

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
