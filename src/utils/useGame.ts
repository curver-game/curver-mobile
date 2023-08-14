import {
    Transforms2d,
    useComputedValue,
    useValue,
    useValueEffect,
} from '@shopify/react-native-skia'
import { Player, UUID, UpdateMessage } from '../types'
import { convertUnitVectorToRadians } from './geometry'
import { useCallback, useState } from 'react'
import {
    Position,
    transformGameSpaceToScreenSpace,
    useGameAreaScaleFactor,
} from './gameArea'
import { DELTA_POS_PER_TiCK } from './constants'
import { useListenToSpecificMessage } from './messageListener'

export function useGame() {
    const players = useValue<Record<UUID, Player>>({})
    const playerPaths = useValue<Record<UUID, string[]>>({})
    const playerAngles = useValue<Record<UUID, number>>({})

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

    const setInitialPosition = useCallback(
        (id: UUID, position: Position) => {
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
        },
        [playerPaths, players]
    )

    const updatePaths = useCallback(() => {
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
    }, [playerPaths, players])

    const updatePlayers = useCallback(
        (update: UpdateMessage) => {
            // calculate new position based on delta
            for (const serverPlayer of update.players) {
                const clientPlayer = players.current[serverPlayer.id]

                if (!clientPlayer) continue

                const deltaPosInGameSpace: Position = {
                    x: serverPlayer.angleUnitVectorX * DELTA_POS_PER_TiCK,
                    y: serverPlayer.angleUnitVectorY * DELTA_POS_PER_TiCK,
                }

                const deltaPosInScreenSpace = transformGameSpaceToScreenSpace(
                    deltaPosInGameSpace,
                    gameAreaScaleFactor
                )

                const newPos: Position = {
                    x: clientPlayer.x + deltaPosInScreenSpace.x,
                    y: clientPlayer.y + deltaPosInScreenSpace.y,
                }

                players.current = {
                    ...players.current,
                    [serverPlayer.id]: {
                        ...clientPlayer,
                        x: newPos.x,
                        y: newPos.y,
                    },
                }

                playerAngles.current = {
                    ...playerAngles.current,
                    [serverPlayer.id]: convertUnitVectorToRadians({
                        x: serverPlayer.angleUnitVectorX,
                        y: serverPlayer.angleUnitVectorY,
                    }),
                }
            }
        },
        [gameAreaScaleFactor, playerAngles, players]
    )

    useListenToSpecificMessage(
        (message) => {
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
            }

            if (updateMessage.gameState === 'started') {
                updatePlayers(updateMessage)
                updatePaths()
            }
        },
        [
            gameAreaScaleFactor,
            players,
            setInitialPosition,
            updatePaths,
            updatePlayers,
        ],
        'update'
    )

    const playerRotations = useComputedValue<Record<UUID, Transforms2d>>(() => {
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

    useValueEffect(players, () => {
        setPlayerIds(Object.keys(players.current))
    })

    return {
        updatePaths,
        playerIds,
        playerPathStrings,
        playerPaths,
        playerRotations,
        players,
    }
}
