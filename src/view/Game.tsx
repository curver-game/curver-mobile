import {
  Canvas,
  Path,
  useValue,
  Text,
  useFont,
  Rect,
  Shadow,
  ImageSVG,
  Selector,
  useComputedValue,
} from "@shopify/react-native-skia";

import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text as RNText,
  TouchableOpacity,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import {
  GAME_AREA_X,
  GAME_AREA_Y,
  GAME_AREA_WIDTH,
  GAME_AREA_BORDER,
  GAME_AREA_HEIGHT,
  WIDTH,
  HEIGHT,
  transformToScreen,
  transformToBackend,
  radiansToDegrees,
  HEAD_SVG,
  HEAD_SIZE,
  TICK,
} from "../utils/geometry";
import { useRealUser } from "../utils/useRealUser";
import { useGameState } from "../utils/useGameState";
import { GameState, MessageToReceive, UpdateMessage } from "../types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackProps } from "../navigation";
import { gameWebsocket } from "../api/websocket";
import { useForceUpdate } from "../utils/useForceUpdate";

export let lastTimestamp = 0;
export const maxFPS = 60;
export const minFrameTime = 1000 / maxFPS;

let lastServerTimestamp = 0;
const minServerFrameTime = 1000 / TICK;

const initialPosition = transformToScreen({ x: 75, y: 50 });

export function GameScreen() {
  const gameState = useRef<GameState>("waiting");
  const shouldShowReady = useRef(false);

  const forceUpdate = useForceUpdate();

  const player1Position = useValue(initialPosition);
  const player1Paths = useValue<string[]>([]);

  const drawPlayer1 = () => {
    player1Paths.current = [
      ...player1Paths.current,
      `L ${player1Position.current.x} ${player1Position.current.y}`,
    ];
  };

  const player1Path = useComputedValue(() => {
    return player1Paths.current.join(" ");
  }, [player1Paths]);

  const {
    params: { roomId, userId },
  } = useRoute<RouteProp<RootStackProps, "Game">>();

  /*  const {
    position,
    rotateAngle,
    update: updateUser,
    draw: drawUser,
    gesture,
    headX,
    headY,
    headRotation,
    path,
  } = useRealUser(); */

  const { gesture } = useRealUser();

  const gameClock = useValue(0);

  const font = useFont(require("./../../assets/Inter.ttf"), 16);
  const debugText = useValue("debug");

  const onMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as MessageToReceive;

    if (message.type === "update") {
      const updateMessage = message as UpdateMessage;
      gameState.current = updateMessage.gameState;

      if (updateMessage.gameState === "countdown") {
        player1Position.current = transformToScreen(updateMessage.players[0]);
        player1Paths.current = [
          `M ${player1Position.current.x} ${player1Position.current.y}`,
        ];
      }

      if (updateMessage.gameState === "started") {
        const newPos = {
          x:
            player1Position.current.x +
            updateMessage.players[0].angleUnitVectorX,
          y:
            player1Position.current.y +
            updateMessage.players[0].angleUnitVectorY,
        };
        player1Position.current = newPos;
        console.log("newPos", player1Position.current);
        drawPlayer1();
      }

      /*  const playersWithoutUser = updateMessage.players.filter(
        (p) => p.id !== userId
      ); */
      /*  setPlayers(playersWithoutUser); */

      if (updateMessage.players.length >= 2) {
        shouldShowReady.current = true;
      }
      forceUpdate();
    }
  };

  useEffect(() => {
    gameWebsocket.socket?.addEventListener("message", onMessage);

    return () => {
      gameWebsocket.socket?.removeEventListener("message", onMessage);
    };
  }, []);

  const onReady = () => {
    gameWebsocket.sendMessage({
      type: "isReady",
      isReady: true,
    });
  };

  /*   const drawDebug = () => {
    const { x, y } = transformToBackend(position.current);
    const degrees = radiansToDegrees(rotateAngle.current);
    debugText.current = `
    x: ${position.current.x.toFixed(1)} y: ${position.current.y.toFixed(1)}
    width: ${WIDTH.toFixed(1)} height: ${HEIGHT.toFixed(1)}
    backend x: ${x.toFixed(1)} backend y: ${y.toFixed(1)}
    angle: ${degrees.toFixed(1)}
    `;
  }; */

  const uiLoop = (timestamp: number) => {
    requestAnimationFrame(uiLoop);

    if (timestamp - lastTimestamp < minFrameTime) {
      return;
    }

    if (gameState.current === "waiting") {
      return;
    }

    /*   updateUser();
    updateOthers();

    drawUser();
    drawOthers(); */

    //drawDebug();
    lastTimestamp = timestamp;
    gameClock.current += 1;
  };

  const serverLoop = (timestamp: number) => {
    requestAnimationFrame(serverLoop);

    if (timestamp - lastServerTimestamp < minServerFrameTime) {
      return;
    }

    lastServerTimestamp = timestamp;
  };

  useEffect(() => {
    requestAnimationFrame(uiLoop);
    requestAnimationFrame(serverLoop);
  }, []);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Canvas style={[styles.container]}>
          <Rect
            x={GAME_AREA_X}
            y={GAME_AREA_Y}
            width={GAME_AREA_WIDTH + GAME_AREA_BORDER * 2}
            height={GAME_AREA_HEIGHT + GAME_AREA_BORDER * 2}
            color={"white"}
            style={"stroke"}
            strokeWidth={5}
          />
          {/*          <Rect
            x={GAME_AREA_X}
            y={GAME_AREA_Y}
            width={GAME_AREA_WIDTH + GAME_AREA_BORDER * 2}
            height={GAME_AREA_HEIGHT + GAME_AREA_BORDER * 2}
            color={"white"}
            style={"stroke"}
            strokeWidth={5}
          />
          <Path
            key={`path_real`}
            path={path}
            color={"cyan"}
            strokeWidth={5}
            style="stroke"
          >
            <Shadow dx={0} dy={0} color={"cyan"} blur={10} />
          </Path>

          {HEAD_SVG && (
            <ImageSVG
              origin={position}
              svg={HEAD_SVG}
              x={headX}
              y={headY}
              width={HEAD_SIZE}
              height={HEAD_SIZE}
              transform={headRotation}
            />
          )} */}

          <Path
            key={"pathother"}
            path={player1Path}
            color={"white"}
            strokeWidth={5}
            style="stroke"
          >
            <Shadow dx={0} dy={0} color={"white"} blur={10} />
          </Path>

          {/* 
          {gameState.current === "started" && (
            <Path
              key={"pathother"}
              path={Selector(playersPathStrings, (p) => p[1])}
              color={"white"}
              strokeWidth={5}
              style="stroke"
            >
              <Shadow dx={0} dy={0} color={"white"} blur={10} />
            </Path>
          )} */}

          <Text x={50} y={16} text={debugText} font={font} color={"white"} />
        </Canvas>
      </GestureDetector>
      {gameState.current === "waiting" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <RNText style={{ color: "white" }}>
            {`Waiting to other players...\n\nRoom ID: ${roomId}\nUser ID: ${userId}`}
          </RNText>
          {shouldShowReady.current && (
            <TouchableOpacity onPress={onReady}>
              <RNText style={{ color: "white" }}>Ready</RNText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121f33",
  },
});
