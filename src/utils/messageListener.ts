import { DependencyList, useEffect } from 'react'
import { MessageToReceive } from '../types'
import { gameWebsocket } from '../api/websocket'

/**
 * Message type is passed as the last argument to make sure it runs properly with react-hooks/exhaustive-deps
 */
export function useListenToSpecificMessage<
    MessageType extends MessageToReceive['type'],
>(
    callBack: (
        message: Extract<MessageToReceive, { type: MessageType }>
    ) => void,
    dependencies: DependencyList,
    messageType: MessageType
) {
    useListenToMessages((message) => {
        if (message.type === messageType) {
            callBack(
                message as Extract<MessageToReceive, { type: MessageType }>
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)
}

export function useListenToMessages(
    callBack: (message: MessageToReceive) => void,
    dependencies: DependencyList
) {
    useEffect(() => {
        function messageHandler(event: MessageEvent) {
            callBack(JSON.parse(event.data) as MessageToReceive)
        }

        gameWebsocket.socket?.addEventListener('message', messageHandler)

        return () => {
            gameWebsocket.socket?.removeEventListener('message', messageHandler)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)
}
