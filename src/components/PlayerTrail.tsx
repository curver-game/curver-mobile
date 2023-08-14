import { Color, Group, Path, Shadow } from '@shopify/react-native-skia'
import { LINE_STROKE_WIDTH } from '../utils/constants'
import { SkiaSelectorWrapper } from '../types/SkiaSelectorWrapper'

type Props = {
    index: number
    path: SkiaSelectorWrapper<string>
    color: Color
}

export function PlayerTrail({ index, path, color }: Props) {
    return (
        <Group key={`trail_${index}`}>
            <Path
                path={path}
                color={color}
                strokeWidth={LINE_STROKE_WIDTH}
                style="stroke"
            >
                <Shadow dx={0} dy={0} color={color} blur={10} />
            </Path>
        </Group>
    )
}
