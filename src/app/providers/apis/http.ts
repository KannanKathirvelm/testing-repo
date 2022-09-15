import { Injectable, Injector } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { SESSION } from '@constants/session-constants';
import { environment } from '@environment/environment';
import { HTTP } from '@ionic-native/http/ngx';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { CustomHTTPResponse, SessionModel } from '@models/auth/session';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '@providers/service/toast.service';
import { TranslationService } from '@providers/service/translation.service';
import { getLastSegmentFromUrl } from '@utils/global';
import axios from 'axios';

@Injectable()
export class HttpService {

  // -------------------------------------------------------------------------
  // Properties

  private readonly CACHE_ERROR_URL = ['skipped', 'rtd', 'signin', 'token', 'accounts', 'search', 'signup', 'labels', 'change-password'];
  private readonly CACHE_URLS = ['crosswalk', 'pedagogy-search', 'diagnostic'];
  private readonly NO_AUTH_URL = ['/signin', '/token', '/parse'];
  public isRefreshTokenCalled: boolean;
  private authNamespace = 'api/nucleus-auth';
  private DEFAULT_SERIALIZE_TYPE = 'json';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HTTP,
    private toastService: ToastService,
    private storage: Storage,
    private navCtrl: NavController,
    private injector: Injector
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  public get translationService(): TranslationService {
    return this.injector.get(TranslationService);
  }

  public get translate(): TranslateService {
    return this.injector.get(TranslateService);
  }

  /**
   * @function isIOS
   * This Method is used to find out the device is iOS
   */
  public isIOS() {
    return Capacitor.getPlatform() === 'ios';
  }

  /**
   * @function get
   * This Method is used for get method on HTTP request
   */
  public get<T>(url: string, params: any = null, apiHeaders: any = null, downloadProgressCb?): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = apiHeaders ? apiHeaders.headers ? apiHeaders.headers : apiHeaders : {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.isIOS()) {
          const queryParams = this.convertParamsToString(params);
          this.httpService.get(endpoint, queryParams, tokenHeaders).then((result) => {
            const resultData = this.normaliseResponse(result);
            result.data = resultData;
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error, url);
            reject(errorResponse);
          });
        } else {
          const options = {
            headers: tokenHeaders,
            params,
            onDownloadProgress: (progressEvent) => {
              if (downloadProgressCb) {
                downloadProgressCb(progressEvent);
              }
            }
          };
          axios.get(endpoint, options).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }

  /**
   * @function post
   * This Method is used for post method on HTTP request
   */
  public post<T>(url: string, data: any = null, headers: any = null, serializerType: string = this.DEFAULT_SERIALIZE_TYPE, uploadProgressCb?): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.isIOS()) {
          this.setSerializerType(serializerType);
          const requestBody = this.convertParamsToObject(data);
          this.httpService.post(endpoint, requestBody, tokenHeaders).then((result) => {
            const resultData = this.normaliseResponse(result);
            result.data = resultData;
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error, url);
            reject(errorResponse);
          });
        } else {
          const options = {
            headers: tokenHeaders,
            onUploadProgressCb: (progressEvent) => {
              if (uploadProgressCb) {
                uploadProgressCb(progressEvent);
              }
            }
          };
          axios.post(endpoint, data, options
          ).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }

  /**
   * @function put
   * This Method is used for put method on HTTP request
   */
  public put<T>(url: string, data: any = null, headers: any = null, serializerType: string = this.DEFAULT_SERIALIZE_TYPE, uploadProgressCb?): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.isIOS()) {
          this.setSerializerType(serializerType);
          const requestBody = this.convertParamsToObject(data);
          this.httpService.put(endpoint, requestBody, tokenHeaders).then((result) => {
            const resultData = this.normaliseResponse(result);
            result.data = resultData;
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error, url);
            reject(errorResponse);
          });
        } else {
          axios.put(endpoint, data, {
            headers: tokenHeaders
          }).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }

  /**
   * @function delete
   * This Method is used for delete method on HTTP request
   */
  public delete<T>(url: string, data: any = null, headers: any = null, serializerType: string = this.DEFAULT_SERIALIZE_TYPE): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.isIOS()) {
          this.setSerializerType(serializerType);
          const requestBody = this.convertParamsToObject(data);
          this.httpService.delete(endpoint, requestBody, tokenHeaders)
            .then((result) => {
              const resultData = this.normaliseResponse(result);
              result.data = resultData;
              resolve(result);
            }).catch((error) => {
              const errorResponse = this.handleErrorResponse(error, url);
              reject(errorResponse);
            });
        } else {
          const options = {
            headers: tokenHeaders,
            data,
          };
          axios.delete(endpoint, options).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }

  /**
   * @function post
   * This Method is used for post method on HTTP request
   */
  public postUsingAxios<T>(url: string, data: any = null, headers: any = null, uploadProgressCb?): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        const options = {
          headers: tokenHeaders,
          onUploadProgressCb: (progressEvent) => {
            if (uploadProgressCb) {
              uploadProgressCb(progressEvent);
            }
          }
        };
        axios.post(endpoint, data, options
        ).then((result) => {
          resolve(result);
        }).catch((error) => {
          const errorResponse = this.handleErrorResponse(error.response, url);
          reject(errorResponse);
        });
      });
    });
  }

  /**
   * @function getBasicHeaders
   * This Method is used to get the basic headers
   */
  public getBasicHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${window.btoa(token)}`,
    };
  }

  /**
   * @function getTokenHeaders
   * This Method is used to get the token headers
   */
  public getTokenHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    };
  }

  /**
   * @function getBasicHeaders
   * This Method is used to get the refresh token headers
   */
  public getRefreshTokenHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `RefreshToken ${token}`
    };
  }

  /**
   * @function getNonceHeaders
   * This Method is used to get the nonce headers
   */
  public getNonceHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Nonce ${token}`
    };
  }

  /**
   * @function formURL
   * This Method is used to form url endpoint
   */
  private formURL(url: string) {
    const apiUrl = environment.API_END_POINT;
    if (apiUrl && !url.includes('http')) {
      url = `${apiUrl}/${url}`;
    }
    return url;
  }

  /**
   * @function setAccessToken
   * This Method is set access token for the header
   */
  public setAccessToken(url, headers) {
    return new Promise((resolve, reject) => {
      const hasBasicAuth = this.NO_AUTH_URL.find((path) => {
        return url.indexOf(path) > 0;
      });
      const authorization = headers && headers.Authorization || null;
      if (!hasBasicAuth && !authorization) {
        return this.getAccessToken().then((accessToken) => {
          if (accessToken) {
            const tokenHeader = this.getTokenHeaders(accessToken);
            Object.assign(headers, tokenHeader);
          }
          resolve(headers);
        }, reject);
      }
      resolve(headers);
    });
  }

  /**
   * @function handleErrorResponse
   * This Method is handle errors for the response.
   */
  public handleErrorResponse(error, url) {
    if (this.isIOS()) {
      const errorResponse = error.error;
      error.data = typeof (errorResponse) === 'string' ? errorResponse : JSON.parse(errorResponse);
    }
    const statusCode = error && error.status || null;
    const lastSegment = getLastSegmentFromUrl(url);
    const hasRestrictedUrl = this.CACHE_URLS.find((restrictedURL) => {
      return url.includes(restrictedURL);
    });
    // Currently, excluded the labels API while refreshing the token.
    if ((!this.CACHE_ERROR_URL.includes(lastSegment) || lastSegment === 'labels') && statusCode === 401) {
      if (!this.isRefreshTokenCalled) {
        this.refreshToken();
        this.isRefreshTokenCalled = true;
      }
    } else if (this.CACHE_ERROR_URL.includes(lastSegment) || hasRestrictedUrl) {
      return error;
    } else {
      this.displayMessage('SOMETHING_WENT_WRONG');
    }
    return error;
  }

  /**
   * @function displayMessage
   * This method is used to display the error message
   */
  public displayMessage(errorMessageKey) {
    this.translate.get(errorMessageKey).subscribe((value) => {
      this.toastService.presentToast(value);
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
    return this.post<SessionModel>(endpoint, postData).then((res) => {
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
   * @function getAccessTokenByRefreshToken
   * This Method is used to get the access token by refresh token
   */
  private getAccessTokenByRefreshToken(refreshToken) {
    const endpoint = `${this.authNamespace}/v2/token`;
    const headers = this.getRefreshTokenHeaders(refreshToken);
    return this.post<SessionModel>(endpoint, {}, { headers }).then((res) => {
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
   * @function clearStorage
   * This Method is used to clear the session storage
   */
  public clearStorage() {
    this.storage.clear();
    this.translationService.initTranslate();
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
   * @function convertParamsToObject
   * This Method is used to form params into object
   */
  public convertParamsToObject(params) {
    return params
      ? typeof (params) === 'string'
        ? JSON.parse(params)
        : params
      : null
  }

  /**
   * @function convertParamsToString
   * This Method is used to convert query params to string
   */
  public convertParamsToString(params) {
    if (!params) {
      return;
    }
    const transformedParams = {}
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        transformedParams[key] = params[key].toString();
      }
    });
    return transformedParams;
  }

  /**
   * Set the data serializer which will be used for all future PATCH,
   * POST and PUT requests.
   * Takes a string representing the type of the serializer.
   * @param serializerType
   */
  private setSerializerType(serializerType: string) {
    switch (serializerType) {
      case 'json':
        this.httpService.setDataSerializer('json')
        break
      case 'multipart':
        this.httpService.setDataSerializer('multipart')
        break
      case 'raw':
        this.httpService.setDataSerializer('raw')
        break
      case 'urlencoded':
        this.httpService.setDataSerializer('urlencoded')
        break
      case 'utf8':
        this.httpService.setDataSerializer('utf8')
        break
    }
  }

  /**
   * @function normaliseResponse
   * This method is used to normalise response
   */
  public normaliseResponse(result) {
    if (result && result.data !== '' && result.headers['content-type'] !== 'text/html') {
      return JSON.parse(result.data);
    }
    return null;
  }

  public getAppIdHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': environment.APP_ID,
    };
  }
}
