import {
    AnimatedProps,
    ImageSVG,
    ImageSVGProps,
} from '@shopify/react-native-skia'
import { PLAYER_SVG } from '../utils/drawing'

type Props = Omit<AnimatedProps<ImageSVGProps>, 'svg'>

export function Player(props: Props) {
    return <ImageSVG {...props} svg={PLAYER_SVG} />
}
