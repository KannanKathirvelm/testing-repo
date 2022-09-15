import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { SessionModel } from '@models/auth/session';
import { TenantModel } from '@models/auth/tenant';
import { HttpService } from '@providers/apis/http';
import { SessionService } from '@providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthProvider {

  // -------------------------------------------------------------------------
  // Properties

  private authNamespace = 'api/nucleus-auth';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService, private sessionService: SessionService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function AnonymousUsingNonce
   * This Method is used to get the basic session details using anonymous token
   */
  public signInAnonymousUsingNonce(token: string): Promise<SessionModel> {
    const postData = {
      grant_type: 'anonymous'
    };
    const endpoint = `${this.authNamespace}/v2/signin`;
    const headers = this.httpService.getNonceHeaders(token);
    const reqOpts = { headers };
    return this.httpService.post<SessionModel>(endpoint, postData, reqOpts).then((res) => {
      const data = res.data;
      return this.normalizeSession(data);
    });
  }

  /**
   * @function signInAsAnonymous
   * This Method is used to get the basic session details using anonymous token
   */
  public signInAsAnonymous() {
    const postData = {
      client_id: environment.CLIENT_ID,
      client_key: environment.CLIENT_KEY,
      grant_type: 'anonymous'
    };
    const endpoint = `${this.authNamespace}/v2/signin`;
    return this.httpService.post<SessionModel>(endpoint, postData).then((res) => {
      const data = res.data;
      return this.normalizeSession(data);
    });
  }

  /**
   * @function getAccessTokenByRefreshToken
   * This Method is used to get the access token by refresh token
   */
  public getAccessTokenByRefreshToken(refreshToken) {
    const endpoint = `${this.authNamespace}/v2/token`;
    const headers = this.httpService.getRefreshTokenHeaders(refreshToken);
    return this.httpService.post<SessionModel>(endpoint, {}, { headers }).then((res) => {
      const data = res.data;
      return this.normalizeSession(data);
    }, () => {
      this.sessionService.sessionInValidate();
    });
  }

  /**
   * @function normalizeSession
   * This Method is used to normalize the session
   */
  public normalizeSession(response, token?) {
    const result: SessionModel = {
      partnerId: response.partner_id,
      appId: response.app_id,
      access_token: response.access_token || token,
      access_token_validity: response.access_token_validity,
      cdn_urls: response.cdn_urls,
      provided_at: response.provided_at,
      user_id: response.user_id,
      username: response.username,
      email: response.email,
      first_name: response.first_name,
      last_name: response.last_name,
      user_category: response.user_category,
      tenant: this.normalizeTenant(response.tenant || {}),
      thumbnail: response.cdn_urls.user_cdn_url + response.thumbnail,
      refresh_token: response.refresh_token
    };
    return result;
  }

  /**
   * @function normalizeTenant
   * This Method is used to normalize the tenant
   */
  public normalizeTenant(tenant) {
    const tenantModel: TenantModel = {
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
   * @function signUpWithCredential
   * This method is used to sign up with credential
   */
  public signUpWithCredential(signUpFormContent): Promise<SessionModel> {
    const endpoint = `${this.authNamespace}/v2/signup`;
    return this.httpService.post<SessionModel>(endpoint, signUpFormContent).then((res) => {
      const data = res.data;
      return this.normalizeSession(data);
    });
  }

  /**
   * @function signInWithCredential
   * This method is used to sign in with username and password
   */
  public signInWithCredential(
    usernameOrEmail: string,
    password: string,
    accessToken: string = null
  ): Promise<SessionModel> {
    const postData: any = {};
    postData.grant_type = 'credential';
    postData.long_lived_access = true;
    if (accessToken) {
      postData.anonymous_token = accessToken;
    } else {
      postData.client_id = environment.CLIENT_ID;
      postData.client_key = environment.CLIENT_KEY;
    }
    const endpoint = `${this.authNamespace}/v2/signin`;
    const token = `${usernameOrEmail}:${password}`;
    const headers = this.httpService.getBasicHeaders(token);
    const reqOpts = { headers };
    return this.httpService.post<SessionModel>(endpoint, postData, reqOpts)
      .then((res) => {
        const response = res.data;
        return this.normalizeSession(response);
      });
  }

  /**
   * @function updateUserProfile
   * This method is used to update profile details
   */
  public updateUserProfile(userDetails, token?) {
    const endpoint = `${this.authNamespace}/v2/users`;
    let reqOpts;
    if (token) {
      const headers = this.httpService.getTokenHeaders(token);
      reqOpts = { headers };
    }
    return this.httpService.put(endpoint, userDetails, reqOpts);
  }

  /**
   * @function signInWithToken
   * This method is used to sign in with token and it returns the basic session data
   */
  public signInWithToken(token: string): Promise<SessionModel> {
    const endpoint = `${this.authNamespace}/v2/token`;
    const headers = this.httpService.getTokenHeaders(token);
    return this.httpService.get<SessionModel>(endpoint, null, headers)
      .then((res) => {
        const response = res.data;
        if (!response.user_category) {
          this.updateUserProfile({ user_category: 'teacher' }, token);
        }
        return this.normalizeSession(response, token);
      });
  }

  /**
   * @function fetchTenantList
   * This Method is used to get tenant list based on tenant
   */
  public fetchTenantList(email: string) {
    const postData = {
      email
    };
    const endpoint = `${this.authNamespace}/v2/users/accounts`;
    return this.httpService.post<Array<TenantModel>>(endpoint, postData)
      .then((tenantListResponse) => {
        const tenantList = tenantListResponse.data.user_accounts;
        return tenantList.map((item) => {
          return this.normalizeTenant(item);
        });
      });
  }

  /**
   * @function forgotPassword
   * This Method is used to reset the forgot password
   */
  public forgotPassword(email, tenantId) {
    const postData = {
      email,
      tenant_id: tenantId
    };
    const endpoint = `${this.authNamespace}/v2/users/reset-password`;
    return this.httpService.post(endpoint, postData);
  }

  /**
   * @function signOut
   * This method is used to sign out.
   */
  public signOut() {
    const endpoint = `${this.authNamespace}/v2/signout`;
    return this.httpService.delete(endpoint, null);
  }

  /**
   * @function revokeRefreshToken
   * This method is used to revoke the refresh token access.
   */
  public revokeRefreshToken() {
    const endpoint = `${this.authNamespace}/v2/refresh-token/revoke`;
    return this.httpService.delete(endpoint, null);
  }

  /**
   * @function changePassword
   * This method is used to change password
   */
  public changePassword(params) {
    const endpoint = `${this.authNamespace}/v2/users/change-password`;
    return this.httpService.put(endpoint, params);
  }
}
