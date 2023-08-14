import { UUID } from '.'

export type Player = {
    id: UUID
    x: number
    y: number
    angleUnitVectorX: number
    angleUnitVectorY: number
    isReady: boolean
}
