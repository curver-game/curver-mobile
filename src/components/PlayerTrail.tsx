import { Color, Group, Path, PathDef, Shadow } from '@shopify/react-native-skia'
import { LINE_STROKE_WIDTH } from '../utils/constants'

type Props = {
    path: PathDef
    color: Color
}

export function PlayerTrail({ path, color }: Props) {
    return (
        <Group>
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
