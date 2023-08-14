import { useRef } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { useSafeAreaFrame } from 'react-native-safe-area-context'
import { convertRadiansToUnitVector, degreesToRadians } from './geometry'
import { gameWebsocket } from '../api/websocket'

export function useChangeDirectionGesture() {
    const directionHeld = useRef<'right' | 'left' | null>(null)
    const userAngleRadians = useRef(0)

    const { width: screenWidth } = useSafeAreaFrame()

    const gesture = Gesture.Pan()
        .onBegin((event) => {
            if (event.x > screenWidth / 2) {
                directionHeld.current = 'right'
            } else {
                directionHeld.current = 'left'
            }
        })
        .onTouchesUp(() => {
            directionHeld.current = null
        })

    function sendDirectionChangeToServerIfNeeded() {
        if (directionHeld.current === null) {
            return
        }

        userAngleRadians.current = degreesToRadians(
            (directionHeld.current === 'right' ? 1 : -1) * 5
        )

        const delta = convertRadiansToUnitVector(userAngleRadians.current)

        console.log('sending direction update')

        gameWebsocket.sendMessage({
            type: 'rotate',
            angleUnitVectorX: delta.x,
            angleUnitVectorY: delta.y,
        })
    }

    return {
        gesture,
        sendDirectionChangeToServerIfNeeded,
    }
}
