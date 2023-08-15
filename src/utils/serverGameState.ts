import { useValue, useValueEffect } from '@shopify/react-native-skia'
import { Player, UUID } from '../types'
import { useState } from 'react'
import { useListenToSpecificMessage } from './messageListener'

export function useServerGameState() {
    const players = useValue<Record<UUID, Player>>({})
    const [playerIds, setPlayerIds] = useState<UUID[]>([])

    useListenToSpecificMessage(
        (message) => {
            if (message.gameState === 'waiting') {
                return
            }

            players.current = mapPlayersWithPlayerIds(message.players)
        },
        [players],
        'update'
    )

    useValueEffect(players, () => {
        setPlayerIds(Object.keys(players.current))
    })

    return {
        playerIds,
        players,
    }
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
