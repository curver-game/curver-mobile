import { View, Text, TouchableOpacity } from "react-native";
import { useAppNavigation } from "../utils";

export function HomeScreen() {
  const navigation = useAppNavigation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home</Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Game", {
            roomId: "123",
          });
        }}
      >
        <Text>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}
