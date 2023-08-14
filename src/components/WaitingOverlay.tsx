import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
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
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
            }}
        >
            <Text style={{ color: 'white' }}>
                {`Waiting to other players...\n\nRoom ID: ${roomId}\nUser ID: ${userId}`}
            </Text>
            {shouldShowReadyButton && (
                <TouchableOpacity onPress={sendReadyMessage}>
                    <Text style={{ color: 'white' }}>Ready</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}
