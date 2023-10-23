import { Path, UUID } from '..'
import { GameState } from '../GameState'
import { Player } from '../Player'
import { GameOutcome } from '../GameOutcome'

export type CreatedRoomMessage = {
    type: 'createdRoom'
    roomId: UUID
}

export type JoinRoomErrorMessage = {
    type: 'joinRoomError'
    reason: string
}

export type JoinedRoomMessage = {
    type: 'joinedRoom'
    roomId: UUID
    userId: UUID
}

export type LeftRoomMessage = {
    type: 'leftRoom'
}

export type LeaveRoomErrorMessage = {
    type: 'leaveRoomError'
    reason: string
}

export type UpdateMessage = {
    type: 'update'
    players: Player[]
    gameState: GameState
}

export type SyncPathsMessage = {
    type: 'syncPaths'
    paths: Record<UUID, Path>
}

export type GameEndedMessage = {
    type: 'gameEnded'
    outcome: GameOutcome
}

export type UserEliminatedMessage = {
    type: 'userEliminated'
    userId: UUID
}

export type FaultyMessage = {
    type: 'faultyMessage'
    message: string
}

export type MessageToReceive =
    | CreatedRoomMessage
    | JoinRoomErrorMessage
    | JoinedRoomMessage
    | LeftRoomMessage
    | LeaveRoomErrorMessage
    | UpdateMessage
    | SyncPathsMessage
    | GameEndedMessage
    | UserEliminatedMessage
    | FaultyMessage
