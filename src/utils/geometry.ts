import { Skia } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

export type Point = {
  x: number;
  y: number;
};

export let WIDTH = Dimensions.get("window").width;
export let HEIGHT = Dimensions.get("window").height;

export const GAME_AREA_ASPECT_RATIO = 1.5;
export const GAME_AREA_HEIGHT = HEIGHT * 0.9;
export const GAME_AREA_WIDTH = GAME_AREA_HEIGHT * GAME_AREA_ASPECT_RATIO;
export const GAME_AREA_BORDER = 5;
export const GAME_AREA_X = WIDTH / 2 - GAME_AREA_WIDTH / 2;
export const GAME_AREA_Y = HEIGHT / 2 - GAME_AREA_HEIGHT / 2;

export const TICK = 20;
export const DELTA_POS_PER_SECOND = 10;
export const SPEED = DELTA_POS_PER_SECOND / TICK;

// backend game area is 150x100
export const SCALE_FACTOR = GAME_AREA_HEIGHT / 100;

export function transformToScreen(p: Point): Point {
  return {
    x: p.x * SCALE_FACTOR + GAME_AREA_X + GAME_AREA_BORDER,
    y: p.y * SCALE_FACTOR + GAME_AREA_Y + GAME_AREA_BORDER,
  };
}

export function transformToBackend(p: Point): Point {
  return {
    x: (p.x - GAME_AREA_X - GAME_AREA_BORDER) / SCALE_FACTOR,
    y: (p.y - GAME_AREA_Y - GAME_AREA_BORDER) / SCALE_FACTOR,
  };
}

export function rotatePoint(rot: number): Point {
  let cos = Math.cos(rot);
  let sin = Math.sin(rot);
  return {
    x: cos,
    y: sin,
  };
}

export const degreesToRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

export const radiansToDegrees = (radians: number) => {
  return (radians * 180) / Math.PI;
};

export const degreeFromUnitVector = (v: Point) => {
  return radiansToDegrees(Math.atan2(v.y, v.x));
};

export const HEAD_SVG = Skia.SVG
  .MakeFromString(`<svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.18168 0.360927C6.30895 0.134899 6.63441 0.134899 6.76167 0.360927L11.9567 9.58736C12.0816 9.80921 11.9213 10.0834 11.6667 10.0834H1.27665C1.02205 10.0834 0.861739 9.80921 0.986654 9.58736L6.18168 0.360927Z" fill="#D9D9D9"/>
<path d="M6.14828 5.08781C6.27546 4.86136 6.60146 4.86135 6.72864 5.08781L9.24396 9.56663C9.36855 9.78848 9.20823 10.0624 8.95379 10.0624H3.92313C3.66869 10.0624 3.50837 9.78848 3.63296 9.56663L6.14828 5.08781Z" fill="#4BC7BF"/>
</svg>
`);

export const HEAD_SIZE = 20;
