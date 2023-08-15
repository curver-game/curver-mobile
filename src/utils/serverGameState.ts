import { useValue, useValueEffect } from '@shopify/react-native-skia'
import { Player, UUID } from '../types'
import { useState } from 'react'
import { useListenToSpecificMessage } from './messageListener'
import { Position } from './gameArea'

export function useServerGameState() {
    const players = useValue<Record<UUID, Player>>({})
    const paths = useValue<Record<UUID, Position[]>>({})
    const [playerIds, setPlayerIds] = useState<UUID[]>([])

    useListenToSpecificMessage(
        (message) => {
            if (message.gameState === 'waiting') {
                return
            }

            players.current = mapPlayersWithPlayerIds(message.players)

            if (message.gameState === 'started') {
                paths.current = updatePlayerPaths(
                    players.current,
                    paths.current
                )
            }
        },
        [paths, players],
        'update'
    )

    useValueEffect(players, () => {
        setPlayerIds(Object.keys(players.current))
    })

    return {
        playerIds,
        players,
        paths,
    }
}

function updatePlayerPaths(
    players: Record<UUID, Player>,
    paths: Record<UUID, Position[]>
): Record<UUID, Position[]> {
    const newPaths: Record<UUID, Position[]> = {
        ...paths,
    }

    Object.values(players).forEach((player) => {
        newPaths[player.id] = [
            ...(newPaths[player.id] || []),
            { x: player.x, y: player.y },
        ]
    })

    return newPaths
}

function mapPlayersWithPlayerIds(players: Player[]): Record<UUID, Player> {
    return players.reduce(
        (acc, currentPlayer) => ({
            ...acc,
            [currentPlayer.id]: currentPlayer,
        }),
        {}
    )
}
