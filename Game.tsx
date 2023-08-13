import {
  Canvas,
  Path,
  useComputedValue,
  useValue,
  Text,
  useFont,
  Rect,
  Shadow,
  ImageSVG,
  Skia,
  Transforms2d,
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

const HEAD_SVG = Skia.SVG
  .MakeFromString(`<svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.18168 0.360927C6.30895 0.134899 6.63441 0.134899 6.76167 0.360927L11.9567 9.58736C12.0816 9.80921 11.9213 10.0834 11.6667 10.0834H1.27665C1.02205 10.0834 0.861739 9.80921 0.986654 9.58736L6.18168 0.360927Z" fill="#D9D9D9"/>
<path d="M6.14828 5.08781C6.27546 4.86136 6.60146 4.86135 6.72864 5.08781L9.24396 9.56663C9.36855 9.78848 9.20823 10.0624 8.95379 10.0624H3.92313C3.66869 10.0624 3.50837 9.78848 3.63296 9.56663L6.14828 5.08781Z" fill="#4BC7BF"/>
</svg>
`);

const HEAD_SIZE = 20;

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

const initialPosition = transformToScreen({ x: 75, y: 50 });

export function Game() {
  const position = useValue(initialPosition);

  const paths = useValue<string[]>([
    `M ${position.current.x.toFixed(2)} ${position.current.y.toFixed(2)}`,
  ]);

  const rotateAngle = useValue(degreesToRadians(0));
  const isPressing = useValue<"right" | "left" | null>(null);
  const gameClock = useValue(0);

  const font = useFont(require("./assets/Inter.ttf"), 16);
  const debugText = useValue("debug");

  const deltaPos = useValue<Point>({ x: 0, y: 0 });

  const update = () => {
    if (isPressing.current === "right") {
      rotateAngle.current += degreesToRadians(5);
    }
    if (isPressing.current === "left") {
      rotateAngle.current += -degreesToRadians(5);
    }

    deltaPos.current = rotatePoint(rotateAngle.current);

    const newPos: Point = {
      x: position.current.x + deltaPos.current.x * SPEED * SCALE_FACTOR,
      y: position.current.y + deltaPos.current.y * SPEED * SCALE_FACTOR,
    };

    position.current = newPos;
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
    gameClock.current += 1;
  };

  useEffect(() => {
    requestAnimationFrame(loop);
  }, []);

  const path = useComputedValue(() => {
    return paths.current.join(" ");
  }, [paths]);

  const headPosition = useComputedValue<Point>(() => {
    return {
      x: position.current.x - HEAD_SIZE / 2,
      y: position.current.y - HEAD_SIZE / 2,
    };
  }, [position]);

  const headX = useComputedValue(() => {
    return headPosition.current.x + HEAD_SIZE / 5;
  }, [headPosition]);

  const headY = useComputedValue(() => {
    return headPosition.current.y + HEAD_SIZE / 5;
  }, [headPosition]);

  const headRotation = useComputedValue<Transforms2d>(() => {
    return [
      {
        rotate: rotateAngle.current + Math.PI / 2,
      },
    ];
  }, [rotateAngle]);

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
            color={"white"}
            style={"stroke"}
            strokeWidth={5}
          />
          <Path
            key={`path`}
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
