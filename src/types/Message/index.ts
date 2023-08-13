import { MessageToReceive } from './MessageToReceive';
import { MessageToSend } from './MessageToSend';

export * from './MessageToSend';
export * from './MessageToReceive'

export type Message = MessageToSend | MessageToReceive
