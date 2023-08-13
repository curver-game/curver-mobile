import { View, Text, TouchableOpacity } from "react-native";
import { useAppNavigation } from "../utils";
import { gameWebsocket } from "../api/websocket";
import { CreatedRoomMessage, JoinedRoomMessage, UUID } from "../types";
import { TextInput } from "react-native-gesture-handler";
import { useState } from "react";

gameWebsocket.connect();

export function HomeScreen() {
  const navigation = useAppNavigation();
  const [roomId, setRoomId] = useState<UUID>("");

  const onCreateRoom = async () => {
    const res = (await gameWebsocket.sendMessageWithResponse(
      { type: "createRoom" },
      "joinedRoom"
    )) as JoinedRoomMessage;

    console.log(res);

    navigation.navigate("Game", { roomId: res.roomId, userId: res.userId });
  };

  const onJoinRoom = async () => {
    const res = (await gameWebsocket.sendMessageWithResponse(
      { type: "joinRoom", roomId },
      "joinedRoom"
    )) as JoinedRoomMessage;

    console.log(res);

    navigation.navigate("Game", { roomId: res.roomId, userId: res.userId });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={onCreateRoom}>
        <Text>Start Game</Text>
      </TouchableOpacity>

      <View
        style={{
          marginVertical: 10,
          height: 2,
          width: "60%",
          backgroundColor: "gray",
        }}
      />
      <TextInput
        style={{
          height: 40,
          width: "40%",
          borderColor: "gray",
          borderWidth: 1,
        }}
        placeholder="Room ID"
        value={roomId}
        onChangeText={setRoomId}
      />
      <TouchableOpacity onPress={onJoinRoom}>
        <Text>Join Game</Text>
      </TouchableOpacity>
    </View>
  );
}
