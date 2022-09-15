import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { ModalService } from '@providers/service/modal/modal.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {

  constructor(
    private splashScreen: SplashScreen,
    private modalService: ModalService
  ) { }

  /**
   * @function ionViewDidEnter
   * This Method is used to dismiss modal
   */
  public ionViewDidEnter() {
    this.splashScreen.hide();
    setTimeout(() => {
      this.modalService.dismissModal();
    }, 5000);
  }
}
