import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RxStomp } from '@stomp/rx-stomp';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  public rxStomp: RxStomp | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initStomp();
    }
  }

  private async initStomp() {
    // Dynamically import SockJS to avoid SSR issues
    const SockJS = (await import('sockjs-client')).default;
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => console.log(new Date(), msg)
    });
    this.rxStomp.activate();
  }
}
