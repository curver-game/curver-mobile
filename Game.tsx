import {
  Canvas,
  Path,
  useComputedValue,
  useValue,
  Text,
  useFont,
  Rect,
} from "@shopify/react-native-skia";

import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type Point = {
  x: number;
  y: number;
};

let WIDTH = Dimensions.get("window").width;
let HEIGHT = Dimensions.get("window").height;

const GAME_AREA_ASPECT_RATIO = 1.5;
const GAME_AREA_HEIGHT = HEIGHT * 0.9;
const GAME_AREA_WIDTH = GAME_AREA_HEIGHT * GAME_AREA_ASPECT_RATIO;
const GAME_AREA_BORDER = 5;
const GAME_AREA_X = WIDTH / 2 - GAME_AREA_WIDTH / 2;
const GAME_AREA_Y = HEIGHT / 2 - GAME_AREA_HEIGHT / 2;

// backend game area is 150x100
const SCALE_FACTOR = GAME_AREA_HEIGHT / 100;

let lastTimestamp = 0;
const maxFPS = 60;
const tick = 20;

const minFrameTime = 1000 / maxFPS;

const DELTA_POS_PER_SECOND = 10;
const SPEED = DELTA_POS_PER_SECOND / tick;

function transformToScreen(p: Point): Point {
  return {
    x: p.x * SCALE_FACTOR + GAME_AREA_X + GAME_AREA_BORDER,
    y: p.y * SCALE_FACTOR + GAME_AREA_Y + GAME_AREA_BORDER,
  };
}

function transformToBackend(p: Point): Point {
  return {
    x: (p.x - GAME_AREA_X - GAME_AREA_BORDER) / SCALE_FACTOR,
    y: (p.y - GAME_AREA_Y - GAME_AREA_BORDER) / SCALE_FACTOR,
  };
}

function rotatePoint(rot: number): Point {
  let cos = Math.cos(rot);
  let sin = Math.sin(rot);
  return {
    x: cos,
    y: sin,
  };
}

const degreesToRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

const radiansToDegrees = (radians: number) => {
  return (radians * 180) / Math.PI;
};

export function Game() {
  const position = useValue(transformToScreen({ x: 0, y: 0 }));

  const paths = useValue<string[]>([
    `M ${position.current.x.toFixed(2)} ${position.current.y.toFixed(2)}`,
  ]);

  const rotateAngle = useValue(degreesToRadians(45));
  const isPressing = useValue<"right" | "left" | null>(null);

  const font = useFont(require("./assets/Inter.ttf"), 16);
  const debugText = useValue("debug");

  const deltaPos = useValue<Point>({ x: 0, y: 0 });

  const update = () => {
    // rotate based on angle
    if (isPressing.current === "right") {
      rotateAngle.current += degreesToRadians(5);
    }
    if (isPressing.current === "left") {
      rotateAngle.current += -degreesToRadians(5);
    }

    deltaPos.current = rotatePoint(rotateAngle.current);

    position.current.x += deltaPos.current.x * SPEED * SCALE_FACTOR;
    position.current.y += deltaPos.current.y * SPEED * SCALE_FACTOR;
  };

  const draw = () => {
    paths.current = [
      ...paths.current,
      `L ${position.current.x.toFixed(2)} ${position.current.y.toFixed(2)}`,
    ];
  };

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

    update();
    draw();
    drawDebug();
  };

  useEffect(() => {
    requestAnimationFrame(loop);
  }, []);

  const path = useComputedValue(() => {
    return paths.current.join(" ");
  }, [paths]);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      if (e.x > WIDTH / 2) {
        isPressing.current = "right";
      } else {
        isPressing.current = "left";
      }
    })

    .onTouchesUp(() => {
      isPressing.current = null;
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Canvas style={[styles.container]}>
          <Rect
            x={GAME_AREA_X}
            y={GAME_AREA_Y}
            width={GAME_AREA_WIDTH + GAME_AREA_BORDER * 2}
            height={GAME_AREA_HEIGHT + GAME_AREA_BORDER * 2}
            color={"black"}
            style={"stroke"}
            strokeWidth={5}
          />
          <Path
            key={`path`}
            path={path}
            color={"red"}
            strokeWidth={5}
            style="stroke"
          />

          <Text x={50} y={16} text={debugText} font={font} />
        </Canvas>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
