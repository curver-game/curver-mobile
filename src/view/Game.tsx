import {
    Canvas,
    Path,
    useValue,
    Text,
    useFont,
    Rect,
    Shadow,
    Selector,
    Group,
    ImageSVG,
} from '@shopify/react-native-skia'

import { useEffect, useRef } from 'react'
import {
    StyleSheet,
    View,
    Text as RNText,
    TouchableOpacity,
} from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import {
    GAME_AREA_X,
    GAME_AREA_Y,
    GAME_AREA_WIDTH,
    GAME_AREA_BORDER,
    GAME_AREA_HEIGHT,
    HEAD_SVG,
    HEAD_SIZE,
    LINE_STROKE_WIDTH,
} from '../utils/geometry'
import { useGame } from '../utils/useGame'
import { GameState, MessageToReceive, UpdateMessage } from '../types'
import { RouteProp, useRoute } from '@react-navigation/native'
import { RootStackProps } from '../navigation'
import { gameWebsocket } from '../api/websocket'
import { useForceUpdate } from '../utils/useForceUpdate'

export let lastTimestamp = 0
export const maxFPS = 60
export const minFrameTime = 1000 / maxFPS

const possibleColors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta']

export function GameScreen() {
    const gameState = useRef<GameState>('waiting')
    const shouldShowReady = useRef(false)
    const forceUpdate = useForceUpdate()

    const {
        params: { roomId, userId },
    } = useRoute<RouteProp<RootStackProps, 'Game'>>()

    const {
        updatePaths,
        playerIds,
        playerPathStrings,
        updateUserInteraction,
        gesture,
        headRotations,
        headPositions,
    } = useGame(userId)

    const gameClock = useValue(0)

    const font = useFont(require('./../../assets/Inter.ttf'), 16)
    const debugText = useValue('debug')

    const onMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data) as MessageToReceive

        if (message.type === 'update') {
            const updateMessage = message as UpdateMessage
            gameState.current = updateMessage.gameState

            if (updateMessage.players.length >= 2) {
                shouldShowReady.current = true
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

    const onReady = () => {
        gameWebsocket.sendMessage({
            type: 'isReady',
            isReady: true,
        })
    }

    /*   const drawDebug = () => {
    const { x, y } = transformToBackend(position.current);
    const degrees = radiansToDegrees(rotateAngle.current);
    debugText.current = `
    x: ${position.current.x.toFixed(1)} y: ${position.current.y.toFixed(1)}
    width: ${WIDTH.toFixed(1)} height: ${HEIGHT.toFixed(1)}
    backend x: ${x.toFixed(1)} backend y: ${y.toFixed(1)}
    angle: ${degrees.toFixed(1)}
    `;
  }; */

    const uiLoop = (timestamp: number) => {
        requestAnimationFrame(uiLoop)

        if (timestamp - lastTimestamp < minFrameTime) {
            return
        }

        if (gameState.current === 'waiting') {
            return
        }

        if (gameState.current === 'countdown') {
        }

        if (gameState.current === 'started') {
            updatePaths()
            updateUserInteraction()
        }

        //drawDebug();
        lastTimestamp = timestamp
        gameClock.current += 1
    }

    useEffect(() => {
        requestAnimationFrame(uiLoop)
    }, [])

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Canvas style={[styles.container]}>
                    <Rect
                        x={GAME_AREA_X}
                        y={GAME_AREA_Y}
                        width={GAME_AREA_WIDTH + GAME_AREA_BORDER * 2}
                        height={GAME_AREA_HEIGHT + GAME_AREA_BORDER * 2}
                        color={'white'}
                        style={'stroke'}
                        strokeWidth={5}
                    />

                    {playerIds.map((id, index) => {
                        const path = Selector(playerPathStrings, (p) => p[id])

                        const color =
                            possibleColors[index % possibleColors.length]

                        return (
                            <Group key={`path_${index}`}>
                                <Path
                                    path={path}
                                    color={color}
                                    strokeWidth={LINE_STROKE_WIDTH}
                                    style="stroke"
                                >
                                    <Shadow
                                        dx={0}
                                        dy={0}
                                        color={color}
                                        blur={10}
                                    />
                                </Path>
                            </Group>
                        )
                    })}

                    {playerIds.map((id, index) => {
                        const origin = Selector(headPositions, (p) => {
                            return {
                                x: p[id].x,
                                y: p[id].y,
                            }
                        })
                        const headX = Selector(
                            headPositions,
                            (p) =>
                                p[id].x -
                                (HEAD_SIZE / 2 - LINE_STROKE_WIDTH / 2)
                        )
                        const headY = Selector(
                            headPositions,
                            (p) => p[id].y - HEAD_SIZE / 2
                        )

                        const headRotation = Selector(
                            headRotations,
                            (p) => p[id]
                        )

                        return (
                            <ImageSVG
                                key={`head_${index}`}
                                svg={HEAD_SVG}
                                origin={origin}
                                x={headX}
                                y={headY}
                                width={HEAD_SIZE}
                                height={HEAD_SIZE}
                                color={
                                    possibleColors[
                                        index % possibleColors.length
                                    ]
                                }
                                transform={headRotation}
                            />
                        )
                    })}

                    <Text
                        x={50}
                        y={16}
                        text={debugText}
                        font={font}
                        color={'white'}
                    />
                </Canvas>
            </GestureDetector>

            {gameState.current === 'waiting' && (
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
                    <RNText style={{ color: 'white' }}>
                        {`Waiting to other players...\n\nRoom ID: ${roomId}\nUser ID: ${userId}`}
                    </RNText>
                    {shouldShowReady.current && (
                        <TouchableOpacity onPress={onReady}>
                            <RNText style={{ color: 'white' }}>Ready</RNText>
                        </TouchableOpacity>
                    )}
                </View>
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
