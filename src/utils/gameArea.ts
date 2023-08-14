import { useSafeAreaFrame } from 'react-native-safe-area-context'
import {
    GAME_AREA_BORDER,
    GAME_AREA_SCALE_FACTOR,
    GAME_SPACE_ASPECT_RATIO,
} from './constants'

export type Dimension = {
    width: number
    height: number
}

export type Position = {
    x: number
    y: number
}

export function transformGameSpaceToScreenSpace(
    position: Position,
    gameAreaScaleFactor: number
): Position {
    return {
        x: position.x * gameAreaScaleFactor,
        y: position.y * gameAreaScaleFactor,
    }
}

export function transformScreenSpaceToGameSpace(
    position: Position,
    gameAreaScaleFactor: number
): Position {
    return {
        x: position.x / gameAreaScaleFactor,
        y: position.y / gameAreaScaleFactor,
    }
}

export function useGameAreaScaleFactor(): number {
    const { width } = useSafeAreaFrame()
    const { width: gameAreaWidth } = useGameArea()

    return width / gameAreaWidth
}

export function useCenteredGameAreaPosition(): Position {
    const { width: screenWidth, height: screenHeight } = useSafeAreaFrame()
    const { width: gameAreaWidth, height: gameAreaHeight } = useGameArea()

    const gameAreaX = (screenWidth - gameAreaWidth) / 2 + GAME_AREA_BORDER
    const gameAreaY = (screenHeight - gameAreaHeight) / 2 + GAME_AREA_BORDER

    return {
        x: gameAreaX,
        y: gameAreaY,
    }
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
