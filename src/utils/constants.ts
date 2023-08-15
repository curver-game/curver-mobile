export const GAME_SPACE_WIDTH = 150
export const GAME_SPACE_HEIGHT = 100
export const GAME_SPACE_ASPECT_RATIO = GAME_SPACE_WIDTH / GAME_SPACE_HEIGHT
export const GAME_AREA_SCALE_FACTOR = 0.9
export const GAME_AREA_BORDER_WIDTH = 5

export const TICK_RATE = 20
export const DELTA_POS_PER_SECOND = 10
export const DELTA_POS_PER_TiCK = DELTA_POS_PER_SECOND / TICK_RATE

export const LINE_STROKE_WIDTH = 5
export const PLAYER_SIZE = 20

export const PLAYER_COLORS = [
    'red',
    'green',
    'blue',
    'yellow',
    'cyan',
    'magenta',
] as const
