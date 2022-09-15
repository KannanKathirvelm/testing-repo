import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { SessionService } from '@providers/service/session/session.service';

@Injectable()
export class AppAuthGuard implements CanActivate {
  constructor(private sessionService: SessionService) { }

  public canActivate() {
    return this.isAuthenticated();
  }

  /**
   * @function isAuthenticated
   * This Method is used to check user authenticated or not
   */
  private isAuthenticated(): Promise<boolean> {
    return this.sessionService.isAuthenticated().then(authenticated => {
      return authenticated;
    });
  }
}
