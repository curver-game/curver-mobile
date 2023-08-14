import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { NavigationContainer } from '@react-navigation/native'
import { RootStackNavigator } from './src/navigation'

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <RootStackNavigator />
            </NavigationContainer>
        </GestureHandlerRootView>
    )
}
