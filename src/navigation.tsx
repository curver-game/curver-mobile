import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GameScreen } from "./view/Game";
import { HomeScreen } from "./view/Home";
import { UUID } from "./types";

export type RootStackProps = {
  Home: undefined;
  Game: {
    roomId: UUID;
    userId: UUID;
  };
};

const RootStack = createNativeStackNavigator<RootStackProps>();

export const RootStackNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Home" component={HomeScreen} />
      <RootStack.Screen name="Game" component={GameScreen} />
    </RootStack.Navigator>
  );
};
