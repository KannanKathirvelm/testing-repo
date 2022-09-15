import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { NavController } from '@ionic/angular';
import { SessionService } from '@providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuardService implements CanActivate {

  constructor(private navCtrl: NavController, private sessionService: SessionService) { }

  /**
   * @function canActivate
   * This Method is used to check user is authenticated or not
   */
  public canActivate() {
    return this.sessionService.isAuthenticated().then((authenticated) => {
      if (authenticated) {
        this.navCtrl.navigateForward(routerPath('teacherHome'));
      }
      return !authenticated;
    });
  }
}
