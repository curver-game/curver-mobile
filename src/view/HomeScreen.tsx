import { View, StyleSheet, Button } from 'react-native'
import { useAppNavigation } from '../utils'
import { gameWebsocket } from '../api/websocket'
import { UUID } from '../types'
import { TextInput } from 'react-native-gesture-handler'
import { useState } from 'react'
import * as Clipboard from 'expo-clipboard'

gameWebsocket.connect()

export function HomeScreen() {
    const navigation = useAppNavigation()
    const [roomId, setRoomId] = useState<UUID>('')

    const createRoom = async () => {
        const res = await gameWebsocket.sendMessageAndWaitForResponse({
            type: 'createRoom',
        })

        console.log(res)

        Clipboard.setStringAsync(res.roomId)

        navigation.navigate('Game', { roomId: res.roomId, userId: res.userId })
    }

    const joinRoom = async () => {
        const res = await gameWebsocket.sendMessageAndWaitForResponse({
            type: 'joinRoom',
            roomId,
        })

        console.log(res)

        if (res.type === 'joinRoomError') {
            // TODO: Show room not found
            return
        }

        navigation.navigate('Game', { roomId: res.roomId, userId: res.userId })
    }

    return (
        <View style={styles.container}>
            <Button onPress={createRoom} title="Create a new game" />
            <TextInput
                style={styles.roomIdInput}
                placeholder="Room ID"
                onChangeText={setRoomId}
                onSubmitEditing={joinRoom}
            />
            <Button
                onPress={joinRoom}
                title="Join game"
                disabled={roomId.trim().length === 0}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    roomIdInput: {
        height: 40,
        width: '50%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgba(0,0,0,0.2)',
        padding: 10,
    },
})
