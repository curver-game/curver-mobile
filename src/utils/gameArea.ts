import { useSafeAreaFrame } from 'react-native-safe-area-context'
import {
    GAME_AREA_SCALE_FACTOR,
    GAME_SPACE_ASPECT_RATIO,
    GAME_SPACE_WIDTH,
} from './constants'

export type Dimension = {
    width: number
    height: number
}

export type Position = {
    x: number
    y: number
}

export function transformGameSpacePositionToScreenSpacePosition(
    position: Position,
    gameAreaScaleFactor: number
): Position {
    return {
        x: position.x * gameAreaScaleFactor,
        y: position.y * gameAreaScaleFactor,
    }
}

export function transformScreenSpacePositionToGameSpacePosition(
    position: Position,
    gameAreaScaleFactor: number
): Position {
    return {
        x: position.x / gameAreaScaleFactor,
        y: position.y / gameAreaScaleFactor,
    }
}

export function useGameAreaScaleFactor(): number {
    const { width: gameAreaWidth } = useGameArea()

    return gameAreaWidth / GAME_SPACE_WIDTH
}

export function useGameArea(): Dimension {
    const { width: screenWidth, height: screenHeight } = useSafeAreaFrame()

    const gameAreaWidth = Math.min(
        screenWidth,
        screenHeight * GAME_SPACE_ASPECT_RATIO
    )
    const gameAreaHeight = Math.min(
        screenHeight,
        screenWidth / GAME_SPACE_ASPECT_RATIO
    )

    return {
        width: gameAreaWidth * GAME_AREA_SCALE_FACTOR,
        height: gameAreaHeight * GAME_AREA_SCALE_FACTOR,
    }
}
