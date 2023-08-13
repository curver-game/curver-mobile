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
} from "@shopify/react-native-skia";

import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
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
} from "../utils/geometry";
import { useRealUser } from "../utils/useRealUser";
import { useGameState } from "../utils/useGameState";

export let lastTimestamp = 0;
export const maxFPS = 60;
export const minFrameTime = 1000 / maxFPS;

const initialPosition = transformToScreen({ x: 75, y: 50 });

export function GameScreen() {
  const {
    position,
    rotateAngle,
    update: updateUser,
    draw: drawUser,
    gesture,
    headX,
    headY,
    headRotation,
    path,
  } = useRealUser();

  const {
    playersPathStrings,
    update: updateOthers,
    draw: drawOthers,
  } = useGameState();

  const gameClock = useValue(0);

  const font = useFont(require("./../../assets/Inter.ttf"), 16);
  const debugText = useValue("debug");

  const drawDebug = () => {
    const { x, y } = transformToBackend(position.current);
    const degrees = radiansToDegrees(rotateAngle.current);
    debugText.current = `
    x: ${position.current.x.toFixed(1)} y: ${position.current.y.toFixed(1)}
    width: ${WIDTH.toFixed(1)} height: ${HEIGHT.toFixed(1)}
    backend x: ${x.toFixed(1)} backend y: ${y.toFixed(1)}
    angle: ${degrees.toFixed(1)}
    `;
  };

  const loop = (timestamp: number) => {
    requestAnimationFrame(loop);

    if (timestamp - lastTimestamp < minFrameTime) {
      return;
    }

    lastTimestamp = timestamp;

    updateUser();
    updateOthers();

    drawUser();
    drawOthers();

    drawDebug();
    gameClock.current += 1;
  };

  useEffect(() => {
    requestAnimationFrame(loop);
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
          <Path
            key={`path_real`}
            path={path}
            color={"cyan"}
            strokeWidth={5}
            style="stroke"
          >
            <Shadow dx={0} dy={0} color={"cyan"} blur={10} />
          </Path>
          {Array.from({ length: 1 }).map((_, index) => (
            <Path
              key={`path_${index}`}
              path={Selector(playersPathStrings, (p) => p[index])}
              color={"white"}
              strokeWidth={5}
              style="stroke"
            >
              <Shadow dx={0} dy={0} color={"white"} blur={10} />
            </Path>
          ))}
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
          )}

          <Text x={50} y={16} text={debugText} font={font} color={"white"} />
        </Canvas>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121f33",
  },
});
