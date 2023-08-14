import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { UUID } from '../types'
import { gameWebsocket } from '../api/websocket'

function sendReadyMessage() {
    gameWebsocket.sendMessage({
        type: 'isReady',
        isReady: true,
    })
}

type Props = {
    shouldShowReadyButton: boolean
    userId: UUID
    roomId: UUID
}

export function WaitingOverlay({
    shouldShowReadyButton,
    userId,
    roomId,
}: Props) {
    return (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
            <Text style={{ color: 'white' }}>
                {`Waiting to other players...\n\nRoom ID: ${roomId}\nUser ID: ${userId}`}
            </Text>
            {shouldShowReadyButton && (
                <Button onPress={sendReadyMessage} title={'Ready'} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
})
