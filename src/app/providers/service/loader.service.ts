import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable()
export class LoadingService {

  // -------------------------------------------------------------------------
  // Properties

  public loading: HTMLIonLoadingElement;
  private isLoaderPresent: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private loadingCtrl: LoadingController) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function displayLoader
   * This Method is used to display the loader
   */
  public async displayLoader() {
    if (!this.isLoaderPresent) {
      this.isLoaderPresent = true;
      this.loading = await this.loadingCtrl.create({
        cssClass: 'nav-loader'
      });
      await this.loading.present();
    }
  }

  /**
   * @function dismissLoader
   * This Method is used to hide the loader
   */
  public async dismissLoader() {
    if (this.loading) {
      this.isLoaderPresent = false;
      await this.loading.dismiss();
      this.loading = null;
      return;
    }
  }

  /**
   * @function displayLoaderWithMessage
   * This Method is used to display the loader with message
   */
  public async displayLoaderWithMessage(message) {
    if (!this.isLoaderPresent) {
      this.isLoaderPresent = true;
      this.loading = await this.loadingCtrl.create({
        message
      });
      await this.loading.present();
    }
  }
}
