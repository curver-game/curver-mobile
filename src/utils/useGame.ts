import {
    Transforms2d,
    useComputedValue,
    useValue,
    useValueEffect,
} from '@shopify/react-native-skia'
import { MessageToReceive, Player, UUID, UpdateMessage } from '../types'
import { convertUnitVectorToRadians, degreesToRadians } from './geometry'
import { gameWebsocket } from '../api/websocket'
import { useEffect, useState } from 'react'
import {
    Position,
    transformGameSpaceToScreenSpace,
    useGameAreaScaleFactor,
} from './gameArea'
import { DELTA_POS_PER_TiCK } from './constants'

export function useGame(userId: UUID) {
    const players = useValue<Record<UUID, Player>>({})
    const playerPaths = useValue<Record<UUID, string[]>>({})
    const playerAngles = useValue<Record<UUID, number>>({})
    const realUserAngle = useValue(degreesToRadians(0))
    const [playerIds, setPlayerIds] = useState<UUID[]>([])

    const gameAreaScaleFactor = useGameAreaScaleFactor()

    const playerPathStrings = useComputedValue<Record<UUID, string>>(() => {
        return Object.keys(playerPaths.current).reduce(
            (acc, id) => ({
                ...acc,
                [id]: playerPaths.current[id].join(' '),
            }),
            {}
        )
    }, [playerPaths])

    const setInitialPosition = (id: UUID, position: Position) => {
        const player = players.current[id]
        if (!player) {
            return
        }

        player.x = position.x
        player.y = position.y

        playerPaths.current = {
            ...playerPaths.current,
            [id]: [`M ${position.x} ${position.y}`],
        }
    }

    const updatePaths = () => {
        for (const id in playerPaths.current) {
            const player = players.current[id]
            if (!player) {
                continue
            }

            const path = playerPaths.current[id]
            path.push(`L ${player.x} ${player.y}`)

            playerPaths.current = {
                ...playerPaths.current,
                [id]: path,
            }
        }
    }

    const updatePlayers = (update: UpdateMessage) => {
        // calculate new position based on delta
        for (const player of update.players) {
            const clientPlayer = players.current[player.id]

            if (!clientPlayer) continue

            const newPos: Position = {
                x:
                    clientPlayer.x +
                    player.angleUnitVectorX *
                        DELTA_POS_PER_TiCK *
                        gameAreaScaleFactor,
                y:
                    clientPlayer.y +
                    player.angleUnitVectorY *
                        DELTA_POS_PER_TiCK *
                        gameAreaScaleFactor,
            }

            players.current = {
                ...players.current,
                [player.id]: {
                    ...clientPlayer,
                    x: newPos.x,
                    y: newPos.y,
                },
            }

            playerAngles.current = {
                ...playerAngles.current,
                [player.id]: convertUnitVectorToRadians({
                    x: player.angleUnitVectorX,
                    y: player.angleUnitVectorY,
                }),
            }
        }
    }

    const onMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data) as MessageToReceive

        if (message.type === 'update') {
            const updateMessage = message

            if (updateMessage.gameState === 'countdown') {
                players.current = updateMessage.players.reduce(
                    (acc, player) => ({
                        ...acc,
                        [player.id]: player,
                    }),
                    {}
                )

                // set initial position
                for (const player of updateMessage.players) {
                    setInitialPosition(
                        player.id,
                        transformGameSpaceToScreenSpace(
                            player,
                            gameAreaScaleFactor
                        )
                    )
                }

                // set real user angle
                const realUser = updateMessage.players.find(
                    (player) => player.id === userId
                )

                if (realUser) {
                    realUserAngle.current = convertUnitVectorToRadians({
                        x: realUser.angleUnitVectorX,
                        y: realUser.angleUnitVectorY,
                    })
                }
            }

            if (updateMessage.gameState === 'started') {
                updatePlayers(updateMessage)
            }
        }
    }

    const headRotations = useComputedValue<Record<UUID, Transforms2d>>(() => {
        return Object.keys(playerAngles.current).reduce(
            (acc, id) => ({
                ...acc,
                [id]: [
                    {
                        rotate: playerAngles.current[id] + Math.PI / 2,
                    },
                ],
            }),
            {}
        )
    }, [playerAngles])

    const headPositions = useComputedValue<Record<UUID, Position>>(() => {
        return Object.keys(players.current).reduce((acc, id) => {
            // if player goes right we need add half of the head size to the x position
            // if player goes left we need subtract half of the head size to the x position
            return {
                ...acc,
                [id]: {
                    x: players.current[id].x,
                    y: players.current[id].y,
                },
            }
        }, {})
    }, [players])

    useValueEffect(players, () => {
        setPlayerIds(Object.keys(players.current))
    })

    useEffect(() => {
        gameWebsocket.socket?.addEventListener('message', onMessage)

        return () => {
            gameWebsocket.socket?.removeEventListener('message', onMessage)
        }
    }, [])

    return {
        updatePaths,
        playerIds,
        playerPathStrings,
        playerPaths,
        headRotations,
        headPositions,
    }
}
