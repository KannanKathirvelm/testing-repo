import { Injectable } from '@angular/core';
import { LocationModel } from '@app/models/analytics/analytics';
import { SessionModel } from '@app/models/auth/session';
import { ParseProvider } from '@app/providers/parse/parse';
import { environment } from '@environment/environment';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import { cloneObject } from '@utils/global';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParseService {

  private userSessionSubject: BehaviorSubject<SessionModel>;
  private locationInfoSubject: BehaviorSubject<LocationModel>;

  public get getUserSession() {
    return this.userSessionSubject.value ? this.userSessionSubject.value : null;
  }

  constructor(
    private parseProvider: ParseProvider,
    private utilsService: UtilsService,
    private sessionService: SessionService
  ) {
    this.locationInfoSubject = new BehaviorSubject<LocationModel>(null);
  }

  /**
   * @function trackEvent
   * This Method is used to post analytic events
   */
  public async trackEvent(eventName, context?) {
    const userSession = this.sessionService.userSession;
    const locationInfo = await this.fetchLocationInfo();
    const params = {
      eventName,
      userId: userSession && userSession.user_id || null,
      userName: userSession && userSession.username || null,
      sessionId: this.utilsService.getSessionId(),
      appVersion: environment.APP_VERSION,
      deviceInfo: await this.utilsService.deviceInfo(),
      context,
      locationInfo: locationInfo || null,
      tenantId: userSession && userSession.tenant ? userSession.tenant.tenantId : null,
      tenantShortName: userSession && userSession.tenant ? userSession.tenant.short_name : null
    };
    return this.parseProvider.trackEvent(params);
  }

  /**
   * @function trackErrorLog
   * This Method is used to post error logs
   */
  public async trackErrorLog(errorType, errorMessage, url?, statusCode?) {
    const userSession = this.sessionService.userSession;
    const locationInfo = await this.fetchLocationInfo();
    const params = {
      errorType,
      userId: userSession && userSession.user_id ? userSession.user_id : null,
      sessionId: this.utilsService.getSessionId(),
      appVersion: environment.APP_VERSION,
      deviceInfo: await this.utilsService.deviceInfo(),
      locationInfo: locationInfo || null,
      log: JSON.stringify(errorMessage),
      apiPath: url,
      apiStatusCode: statusCode
    };
    return this.parseProvider.trackErrorLog(params);
  }

  /**
   * @function fetchLocationInfo
   * This method used to get the location info
   */
  public fetchLocationInfo() {
    return new Promise((resolve, reject) => {
      const location = this.locationInfo;
      if (location) {
        resolve(location);
      } else {
        this.parseProvider.fetchLocationInfo().then((response) => {
          this.locationInfoSubject.next(response);
          resolve(response);
        }, reject);
      }
    });
  }

  get locationInfo() {
    return this.locationInfoSubject ? cloneObject(this.locationInfoSubject.value) : null;
  }
}
