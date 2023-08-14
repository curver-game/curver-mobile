import { MessageToReceive, MessageToSend } from '../types'

class GameWebsocket {
    socket: WebSocket | null = null
    constructor() {}

    connect() {
        this.socket = new WebSocket('wss://curver-backend.shuttleapp.rs/ws')

        this.socket.addEventListener('open', () => {
            console.log('connected')
        })

        this.socket.addEventListener('error', (err) => {
            console.log('ws error', err)
        })

        this.socket.addEventListener('close', () => {
            console.log('disconnected')
        })
    }

    sendMessage(message: MessageToSend) {
        if (!this.socket) {
            throw new Error('socket is not connected')
        }

        this.socket.send(JSON.stringify(message))
    }

    sendMessageAndWaitForResponse<
        MessageToSendAndExpectResultType extends keyof MessageToResponseTypeMap,
        MessageToReceiveAsResponse extends Extract<
            MessageToReceive,
            {
                type: MessageToResponseTypeMap[MessageToSendAndExpectResultType]
            }
        >,
    >(
        messageToSend: Extract<
            MessageToSend,
            { type: MessageToSendAndExpectResultType }
        >
    ) {
        if (!this.socket) {
            throw new Error('socket is not connected')
        }

        return new Promise<MessageToReceiveAsResponse>((resolve) => {
            this.socket!.addEventListener('message', (event) => {
                const receivedMessage = JSON.parse(
                    event.data
                ) as MessageToReceive

                if (
                    messageToResponseTypeMap[messageToSend.type].includes(
                        // @ts-expect-error - Typescript expects never
                        receivedMessage.type
                    )
                ) {
                    resolve(receivedMessage as MessageToReceiveAsResponse)
                }
            })

            this.socket!.send(JSON.stringify(messageToSend))
        })
    }
}

const messageToResponseTypeMap = {
    createRoom: ['joinedRoom'],
    leaveRoom: ['leftRoom', 'leaveRoomError'],
    joinRoom: ['joinedRoom', 'joinRoomError'],
} satisfies Partial<
    Record<MessageToSend['type'], Array<MessageToReceive['type']>>
>

type MessageToResponseTypeMap = {
    [K in keyof typeof messageToResponseTypeMap]: (typeof messageToResponseTypeMap)[K][number]
}

export const gameWebsocket = new GameWebsocket()
