import {
  Transforms2d,
  useComputedValue,
  useValue,
} from "@shopify/react-native-skia";
import {
  degreesToRadians,
  HEAD_SIZE,
  Point,
  rotatePoint,
  SCALE_FACTOR,
  SPEED,
  transformToScreen,
  WIDTH,
} from "./geometry";
import { useCallback } from "react";

import { Gesture } from "react-native-gesture-handler";
import { gameWebsocket } from "../api/websocket";

const initialPosition = transformToScreen({ x: 75, y: 50 });

export function useRealUser() {
  const position = useValue(initialPosition);

  const paths = useValue<string[]>([
    `M ${position.current.x.toFixed(2)} ${position.current.y.toFixed(2)}`,
  ]);

  const rotateAngle = useValue(degreesToRadians(0));
  const isPressing = useValue<"right" | "left" | null>(null);
  const deltaPos = useValue<Point>({ x: 0, y: 0 });

  const update = useCallback(() => {
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

    if (isPressing.current) {
      gameWebsocket.sendMessage({
        type: "rotate",
        angleUnitVectorX: deltaPos.current.x,
        angleUnitVectorY: deltaPos.current.y,
      });
    }

    position.current = newPos;
  }, []);

  const draw = () => {
    paths.current = [
      ...paths.current,
      `L ${position.current.x.toFixed(2)} ${position.current.y.toFixed(2)}`,
    ];
  };

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

  const gesture = Gesture.Pan()
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

  return {
    position,
    rotateAngle,
    isPressing,
    deltaPos,
    gesture,
    update,
    draw,
    headPosition,
    headX,
    headY,
    headRotation,
    path,
  };
}
