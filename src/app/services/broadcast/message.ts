import { MessageType } from './message-type';

export class Message {
  readonly type: MessageType;
  readonly text: string;
  readonly timeout: number;

  constructor(type: MessageType, text: string, timeout: number) {
    this.type = type;
    this.text = text;
    this.timeout = timeout;
  }
}
