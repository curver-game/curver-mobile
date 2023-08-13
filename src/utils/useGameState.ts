import { useComputedValue, useValue } from "@shopify/react-native-skia";
import { Player } from "../types";

export function useGameState() {
  const players = useValue<Player[]>([]);

  const playersPathStrings = useValue<string[]>([]);

  const update = () => {};

  const draw = () => {
    playersPathStrings.current = players.current.map((player, index) => {
      return `${playersPathStrings.current[index]} L ${player.x} ${player.y}`;
    });
  };

  const setPlayers = (pls: Player[]) => {
    players.current = pls;
  };

  const playerLength = useComputedValue(() => {
    return Array.from({ length: players.current.length });
  }, [players]);

  return {
    players,
    playersPathStrings,
    update,
    draw,
    setPlayers,
    playerLength,
  };
}
