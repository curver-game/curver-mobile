import {
  Transforms2d,
  useComputedValue,
  useValue,
  useValueEffect,
} from "@shopify/react-native-skia";
import { MessageToReceive, Player, UUID, UpdateMessage } from "../types";
import {
  HEAD_SIZE,
  Point,
  SCALE_FACTOR,
  SPEED,
  WIDTH,
  degreesToRadians,
  radiansFromUnitVector,
  rotatePoint,
  transformToScreen,
} from "./geometry";
import { gameWebsocket } from "../api/websocket";
import { useEffect, useState } from "react";
import { Gesture } from "react-native-gesture-handler";

export function useGame(realUserId: UUID) {
  const players = useValue<Record<UUID, Player>>({});
  const playerPaths = useValue<Record<UUID, string[]>>({});
  const playerAngles = useValue<Record<UUID, number>>({});
  const realUserAngle = useValue(degreesToRadians(0));
  const isPressing = useValue<"right" | "left" | null>(null);
  const [playerIds, setPlayerIds] = useState<UUID[]>([]);

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

  const updatePaths = () => {
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

  const updatePlayers = (update: UpdateMessage) => {
    // calculate new position based on delta
    for (const player of update.players) {
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

      playerAngles.current = {
        ...playerAngles.current,
        [player.id]: radiansFromUnitVector({
          x: player.angleUnitVectorX,
          y: player.angleUnitVectorY,
        }),
      };
    }
  };

  const updateUserInteraction = () => {
    if (isPressing.current === "right") {
      realUserAngle.current += degreesToRadians(5);
    }
    if (isPressing.current === "left") {
      realUserAngle.current += -degreesToRadians(5);
    }

    const delta = rotatePoint(realUserAngle.current);

    if (isPressing.current) {
      gameWebsocket.sendMessage({
        type: "rotate",
        angleUnitVectorX: delta.x,
        angleUnitVectorY: delta.y,
      });
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

        // set real user angle
        const realUser = updateMessage.players.find(
          (player) => player.id === realUserId
        );

        if (realUser) {
          realUserAngle.current = radiansFromUnitVector({
            x: realUser.angleUnitVectorX,
            y: realUser.angleUnitVectorY,
          });
        }
      }

      if (updateMessage.gameState === "started") {
        updatePlayers(updateMessage);
      }
    }
  };

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

  const headRotations = useComputedValue<Record<UUID, Transforms2d>>(() => {
    return Object.keys(playerAngles.current).reduce(
      (acc, id) => ({
        ...acc,
        [id]: [
          {
            rotate: playerAngles.current[id] + Math.PI / 2,
          },
        ],
      }),
      {}
    );
  }, [playerAngles]);

  const headPositions = useComputedValue<Record<UUID, Point>>(() => {
    return Object.keys(players.current).reduce((acc, id) => {
      // if player goes right we need add half of the head size to the x position
      // if player goes left we need subtract half of the head size to the x position
      return {
        ...acc,
        [id]: {
          x: players.current[id].x,
          y: players.current[id].y,
        },
      };
    }, {});
  }, [players]);

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
    updatePaths,
    playerIds,
    playerPathStrings,
    gesture,
    updateUserInteraction,
    playerPaths,
    headRotations,
    headPositions,
  };
}
