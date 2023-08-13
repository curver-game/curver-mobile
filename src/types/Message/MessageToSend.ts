import { UUID } from "..";

export type CreateRoomMessage = {
  type: "createRoom";
};

export type JoinRoomMessage = {
  type: "joinRoom";
  roomId: UUID;
};

export type LeaveRoomMessage = {
  type: "leaveRoom";
};

export type RotateMessage = {
  type: "rotate";
  /**
   * Float between -1 and 1
   */
  angleUnitVectorX: number;
  /**
   * Float between -1 and 1
   */
  angleUnitVectorY: number;
};

export type IsReadyMessage = {
  type: "isReady";
  isReady: boolean;
};

export type MessageToSend =
  | CreateRoomMessage
  | JoinRoomMessage
  | LeaveRoomMessage
  | RotateMessage
  | IsReadyMessage;

export type MessageToSendWithResponse = CreateRoomMessage | JoinRoomMessage;
