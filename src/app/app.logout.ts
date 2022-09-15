import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthProvider } from '@providers/apis/auth/auth';
import { LoadingService } from '@providers/service/loader.service';
import { SessionService } from '@providers/service/session/session.service';
import { Logout } from '@stores/logout.reset';
import { OfflineApiService } from '@providers/service/offline/offline-api.service';

@Injectable()
export class AppLogout {
  constructor(
    private store: Store,
    private authProvider: AuthProvider,
    private sessionService: SessionService,
    private loader: LoadingService,
    private offlineApiService: OfflineApiService
  ) { }

  /**
   * @function execute
   * This Method is used to logout and clear session
   */
  public execute() {
    this.loader.displayLoader();
    this.authProvider.revokeRefreshToken().then(() => {
      this.authProvider.signOut().then(() => {
        this.sessionService.sessionInValidate();
        this.offlineApiService.offlineSettingsSubject.next(null);
        this.store.dispatch(new Logout());
      });
    }).finally(() => {
      this.loader.dismissLoader();
    });
  }
}
