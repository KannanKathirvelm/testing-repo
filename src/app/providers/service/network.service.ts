import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { ToastService } from '@providers/service/toast.service';
import { BehaviorSubject, Observable } from 'rxjs';

export enum ConnectionStatus {
  Offline,
  Online
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private status: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private network: Network,
    private toastService: ToastService
  ) {
  }

  /**
   * @function initializeNetworkEvents
   * This Method is initialize network events
   */
  public initializeNetworkEvents() {
    this.network.onDisconnect().subscribe(() => {
      this.updateNetworkStatus(false);
    });

    this.network.onConnect().subscribe(() => {
      this.updateNetworkStatus(true);
    });

    const status = this.network.type !== 'none';
    this.status.next(status);
  }

  /**
   * @function updateNetworkStatus
   * This Method is used to update status of network
   */
  private async updateNetworkStatus(isOnline: boolean) {
    this.status.next(isOnline);
    // const connectionMsg = this.translate.instant(isOnline ? 'BACK_TO_ONLINE' : 'CONNECTION_MSG');
    const connectionMsg = !isOnline ? 'You’re Offline, Please check your network connection': 'Back to Online';
    this.toastService.presentToast(connectionMsg, isOnline);
  }

  /**
   * @function onNetworkChange
   * This Method is used to check when network is changing
   */
  public onNetworkChange(): Observable<boolean> {
    return this.status.asObservable();
  }
  /**
   * @function isNetworkInOnline
   * This Method is used to give current network status
   */
  get isNetworkInOnline(): boolean {
    return this.status ? this.status.value : null;
  }
}
