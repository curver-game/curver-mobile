import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Game } from "./Game";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Game />
    </GestureHandlerRootView>
  );
}
