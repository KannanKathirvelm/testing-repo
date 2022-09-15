import { Injectable, Injector } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { addHttpsProtocol } from '@app/utils/global';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { SESSION } from '@constants/session-constants';
import { environment } from '@environment/environment';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SessionModel } from '@models/auth/session';
import { HttpService } from '@providers/apis/http';
import { TranslationService } from '@providers/service/translation.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SessionService {

  // -------------------------------------------------------------------------
  // Properties
  private currentSessionSubject: BehaviorSubject<SessionModel>;
  public currentSession: Observable<SessionModel>;
  private authNamespace = 'api/nucleus-auth';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private httpService: HttpService,
    private injector: Injector,
    private storage: Storage,
    private navCtrl: NavController,
    private translationService: TranslationService
  ) {
    this.initSession();
  }

  private get _router() { return this.injector.get(Router); }

  public initSession() {
    return this.getSession().then((session) => {
      this.currentSessionSubject = new BehaviorSubject<SessionModel>(session);
      this.currentSession = this.currentSessionSubject.asObservable();
    });
  }

  /**
   * @function currentSessionValue
   * This Method is used to get the current session detailse
   */
  get userSession(): SessionModel {
    return this.currentSessionSubject ? this.currentSessionSubject.value : null;
  }

  /**
   * @function getUserId
   * This Method is used to get the userid from the ionic storage
   */
  public getUserId() {
    return this.storage.get(SESSION.STORAGE_KEY).then((session) => {
      return session.user_id;
    });
  }

  /**
   * @function getSession
   * This Method is used to get the session details from the ionic storage
   */
  public getSession(): Promise<SessionModel> {
    return this.storage.get(SESSION.STORAGE_KEY).then(session => {
      return session;
    });
  }

  /**
   * @function getRefreshToken
   * This Method is used to get the refresh token details from the ionic storage
   */
  public getRefreshToken() {
    return this.storage.get(SESSION.REFRESH_TOKEN_KEY);
  }

  /**
   * @function getSession
   * This Method is used to set the session
   */
  public setRefreshToken(response) {
    this.storage.set(SESSION.STORAGE_KEY, response);
  }
  /**
   * @function getSession
   * This Method is used to set the session
   */
  public setSession(sessionModel) {
    const refreshToken = sessionModel.refresh_token;
    const thumbnail = addHttpsProtocol(sessionModel.thumbnail);
    const parsedUrls = {
      content_cdn_url: addHttpsProtocol(sessionModel.cdn_urls.content_cdn_url),
      user_cdn_url: addHttpsProtocol(sessionModel.cdn_urls.user_cdn_url)
    };
    sessionModel.login_ref_url = this._router.url;
    sessionModel.thumbnail = thumbnail;
    sessionModel.cdn_urls = parsedUrls;
    this.storage.set(SESSION.STORAGE_KEY, sessionModel);
    this.currentSessionSubject.next(sessionModel);
    if (refreshToken) {
      this.setRefreshTokenInSession(refreshToken);
    }
  }

  /**
   * @function clearStorage
   * This Method is used to clear the session storage
   */
  public clearStorage() {
    this.storage.clear();
    this.translationService.initTranslate();
    this.currentSessionSubject.next(null);
  }

  /**
   * @function sessionInValidate
   * This Method is used to clear the storage and redirectTo login page
   */
  public sessionInValidate() {
    this.clearStorage();
    this.navCtrl.navigateRoot(routerPath('login'));
  }

  /**
   * @function sessionInValidate
   * This Method is used to navigate to home page
   */
  public navigateToHome(queryParams?) {
    this.navCtrl.navigateRoot(routerPath('teacherHome'), queryParams);
  }

  /**
   * @function setRefreshTokenInSession
   * This Method is used to set refresh
   */
  public setRefreshTokenInSession(token) {
    this.storage.set(SESSION.REFRESH_TOKEN_KEY, token);
  }

  /**
   * @function refreshToken
   * This Method is used to call refresh token
   */
  public refreshToken() {
    this.storage.get(SESSION.REFRESH_TOKEN_KEY).then((token) => {
      this.getAccessTokenByRefreshToken(token).then((response) => {
        this.storage.set(SESSION.STORAGE_KEY, response);
        const navigationExtras: NavigationExtras = {
          queryParams: { isReload: true }
        };
        this.navCtrl.navigateRoot(routerPath('teacherHome'), navigationExtras);
      }, () => {
        this.sessionInValidate();
      });
    });
  }

  /**
   * @function getAccessToken
   * This Method is used to get the basic session details from the ionic storage
   */
  public getAccessToken() {
    return this.storage.get(SESSION.STORAGE_KEY).then((session) => {
      if (session === null) {
        return this.signInAsAnonymous().then((sessionModel) => {
          this.storage.set(SESSION.STORAGE_KEY, sessionModel);
          return sessionModel.access_token;
        });
      } else {
        return session.access_token;
      }
    });
  }

  /**
   * @function signInAsAnonymous
   * This Method is used to get the basic session details using anonymous token
   */
  public signInAsAnonymous(): Promise<SessionModel> {
    const postData = {
      client_id: environment.CLIENT_ID,
      client_key: environment.CLIENT_KEY,
      grant_type: 'anonymous'
    };
    const endpoint = `${this.authNamespace}/v2/signin`;
    return this.httpService.post<SessionModel>(endpoint, postData).then((res) => {
      const data = res.data;
      const result: SessionModel = {
        partnerId: data.partner_id,
        appId: data.app_id,
        access_token: data.access_token,
        access_token_validity: data.access_token_validity,
        cdn_urls: data.cdn_urls,
        provided_at: data.provided_at,
        user_id: data.user_id
      };
      return result;
    });
  }

  /**
   * @function getAccessTokenByRefreshToken
   * This Method is used to get the access token by refresh token
   */
  private getAccessTokenByRefreshToken(refreshToken) {
    const endpoint = `${this.authNamespace}/v2/token`;
    const headers = this.httpService.getRefreshTokenHeaders(refreshToken);
    return this.httpService.post<SessionModel>(endpoint, {}, { headers }).then((res) => {
      const data = res.data;
      const result: SessionModel = {
        partnerId: data.partner_id,
        appId: data.app_id,
        access_token: data.access_token,
        access_token_validity: data.access_token_validity,
        cdn_urls: data.cdn_urls,
        provided_at: data.provided_at,
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        user_category: data.user_category,
        tenant: this.normalizeTenant(data.tenant || {}),
        thumbnail: data.cdn_urls.user_cdn_url + data.thumbnail,
      };
      return result;
    });
  }

  /**
   * @function normalizeTenant
   * This Method is used to normalize the tenant
   */
  public normalizeTenant(tenant) {
    const tenantModel = {
      tenantId: tenant.tenant_id,
      image_url: tenant.image_url,
      login_type: tenant.login_type,
      tenant_name: tenant.tenant_name,
      short_name: tenant.short_name,
      settings: tenant.settings,
      tenant_short_name: tenant.tenant_short_name || tenant.short_name,
    };
    return tenantModel;
  }

  /**
   * @function isAuthenticated
   * This Method is used to check the user is authenticated or not
   */
  public isAuthenticated(): Promise<boolean> {
    return this.storage.get(SESSION.STORAGE_KEY).then(session => {
      return this.isLoggedInUser(session);
    });
  }

  /**
   * @function isLoggedInUser
   * This Method is used to check the user is logged in or not
   */
  public isLoggedInUser(session) {
    return (session && session !== null && session.user_id !== 'anonymous');
  }

  /**
   * @function getZoomTokenFromSession
   * This Method is used to get zoom token from session
   */
  public getZoomTokenFromSession() {
    const userId = this.userSession.user_id;
    const zoomSessionKey = `${SESSION.ZOOM_AUTH_TOKEN}_${userId}`;
    return this.storage.get(zoomSessionKey);
  }

  /**
   * @function getConferenceTokenFromSession
   * This Method is used to get token from meet
   */
  public getConferenceTokenFromSession() {
    const userId = this.userSession.user_id;
    const conferenceSessionKey = `${SESSION.MEET_AUTH_TOKEN}_${userId}`;
    return this.storage.get(conferenceSessionKey);
  }

  /**
   * @function setZoomToken
   * This Method is used to set zoom token
   */
  public setZoomToken(token) {
    const userId = this.userSession.user_id;
    const zoomSessionKey = `${SESSION.ZOOM_AUTH_TOKEN}_${userId}`;
    this.storage.set(zoomSessionKey, token);
  }

  /**
   * @function setConferenceToken
   * This Method is used to set conference token
   */
  public setConferenceToken(token) {
    const userId = this.userSession.user_id;
    const conferenceSessionKey = `${SESSION.MEET_AUTH_TOKEN}_${userId}`;
    this.storage.set(conferenceSessionKey, token);
  }

  /**
   * @function setValueToStorage
   * This Method is used to set value to storage
   */
  public setValueToStorage(key, value) {
    this.storage.set(key, value);
  }

  /**
   * @function getValueFromStorage
   * This Method is used to get value from storage
   */
  public getValueFromStorage(key) {
    return this.storage.get(key);
  }
}
