import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Message } from './broadcast/message';
import { MessageType } from './broadcast/message-type';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService implements OnDestroy {
  private readonly _stream: Subject<Message> = new Subject();
  get stream$(): Observable<Message> { return this._stream.asObservable(); }

  ngOnDestroy(): void {
    this._stream.complete();
  }

  message(message: string, timeout: number = 12000): Message {
    return this.alert(MessageType.Default, message, timeout);
  }

  success(text: string, timeout: number = 12000): Message {
    return this.alert(MessageType.Success, text, timeout);
  }

  warning(message: string, timeout: number = 12000): Message {
    return this.alert(MessageType.Warning, message, timeout);
  }

  error(message: string, timeout: number = 12000): Message {
    return this.alert(MessageType.Error, message, timeout);
  }

  environment(message: string, timeout: number = 12000): Message {
    return this.alert(MessageType.Environment, message, timeout);
  }

  exception(error: HttpErrorResponse, timeout: number = 12000): Message {
    return this.alert(MessageType.Error, error?.error?.message ?? error?.message, timeout);
  }

  alert(type: MessageType, text: string, timeout: number): Message {
    const alert = new Message(type, text, timeout);
    this._stream.next(alert);
    return alert;
  }
}
