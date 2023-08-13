import {
  Selector,
  useComputedValue,
  useValue,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import { SCALE_FACTOR, SPEED, transformToScreen } from "./geometry";

type Player = {
  x: number;
  y: number;
  angle_unit_vector_x: number;
  angle_unit_vector_y: number;
  is_ready: boolean;
};

const { x, y } = transformToScreen({ x: 0, y: 0 });

export function useGameState() {
  const players = useValue<Player[]>([
    {
      x,
      y,
      angle_unit_vector_x: 0,
      angle_unit_vector_y: 0,
      is_ready: true,
    },
  ]);

  const playersPathStrings = useValue<string[]>([
    `M ${x.toFixed(2)} ${y.toFixed(2)}`,
  ]);

  const update = () => {
    players.current = players.current.map((player) => {
      const newPos: Player = {
        x: player.x + player.angle_unit_vector_x * SPEED * SCALE_FACTOR,
        y: player.y + player.angle_unit_vector_y * SPEED * SCALE_FACTOR,
        angle_unit_vector_x: player.angle_unit_vector_x,
        angle_unit_vector_y: player.angle_unit_vector_y,
        is_ready: player.is_ready,
      };

      return newPos;
    });
  };

  const draw = () => {
    playersPathStrings.current = players.current.map((player) => {
      return `${playersPathStrings.current} L ${player.x.toFixed(
        2
      )} ${player.y.toFixed(2)}`;
    });
  };

  return {
    players,
    playersPathStrings,
    update,
    draw,
  };
}
