import { Message } from './message';
import { MessageType } from './message-type';

const type: MessageType = MessageType.Default;
const text: string = 'Test message.';
const timeout: number = 10000;

describe('Message', () => {
  it('should create', () => {
    const message = new Message(type, text, timeout);

    expect(message).toBeTruthy();
    expect(message.type).toEqual(type);
    expect(message.text).toEqual(text);
    expect(message.timeout).toEqual(timeout);
  });
});
