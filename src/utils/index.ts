import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackProps } from '../navigation'

export function useAppNavigation() {
    return useNavigation<NavigationProp<RootStackProps>>()
}
