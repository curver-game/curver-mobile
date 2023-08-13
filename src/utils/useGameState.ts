import {
  useComputedValue,
  useValue,
  useValueEffect,
} from "@shopify/react-native-skia";
import { MessageToReceive, Player, UUID, UpdateMessage } from "../types";
import { Point, SCALE_FACTOR, SPEED, transformToScreen } from "./geometry";
import { gameWebsocket } from "../api/websocket";
import { useEffect, useState } from "react";

export function useGameState() {
  const players = useValue<Record<UUID, Player>>({});
  const [playerIds, setPlayerIds] = useState<UUID[]>([]);

  const playerPaths = useValue<Record<UUID, string[]>>({});

  const playerPathStrings = useComputedValue<Record<UUID, string>>(() => {
    return Object.keys(playerPaths.current).reduce(
      (acc, id) => ({
        ...acc,
        [id]: playerPaths.current[id].join(" "),
      }),
      {}
    );
  }, [playerPaths]);

  const setInitialPosition = (id: UUID, pos: Point) => {
    const player = players.current[id];
    if (!player) {
      return;
    }

    player.x = pos.x;
    player.y = pos.y;

    playerPaths.current = {
      ...playerPaths.current,
      [id]: [`M ${pos.x} ${pos.y}`],
    };
  };

  const draw = () => {
    for (const id in playerPaths.current) {
      const player = players.current[id];
      if (!player) {
        continue;
      }

      const path = playerPaths.current[id];
      path.push(`L ${player.x} ${player.y}`);

      playerPaths.current = {
        ...playerPaths.current,
        [id]: path,
      };
    }
  };

  const onMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as MessageToReceive;

    if (message.type === "update") {
      const updateMessage = message;

      if (updateMessage.gameState === "countdown") {
        players.current = updateMessage.players.reduce(
          (acc, player) => ({
            ...acc,
            [player.id]: player,
          }),
          {}
        );

        // set initial position
        for (const player of updateMessage.players) {
          setInitialPosition(player.id, transformToScreen(player));
        }
      }

      if (updateMessage.gameState === "started") {
        // calculate new position based on delta
        for (const player of updateMessage.players) {
          const clientPlayer = players.current[player.id];

          if (!clientPlayer) continue;

          const newPos: Point = {
            x: clientPlayer.x + player.angleUnitVectorX * SPEED * SCALE_FACTOR,
            y: clientPlayer.y + player.angleUnitVectorY * SPEED * SCALE_FACTOR,
          };

          players.current = {
            ...players.current,
            [player.id]: {
              ...clientPlayer,
              x: newPos.x,
              y: newPos.y,
            },
          };
        }
      }
    }
  };

  useValueEffect(players, () => {
    setPlayerIds(Object.keys(players.current));
  });

  useEffect(() => {
    gameWebsocket.socket?.addEventListener("message", onMessage);

    return () => {
      gameWebsocket.socket?.removeEventListener("message", onMessage);
    };
  }, []);

  return {
    players,
    draw,
    playerIds,
    playerPathStrings,
  };
}
