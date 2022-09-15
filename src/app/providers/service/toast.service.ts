import { Injectable } from '@angular/core';
import { TOAST_TYPE } from '@constants/helper-constants';
import { ToastController } from '@ionic/angular';

@Injectable()
export class ToastService {

  // -------------------------------------------------------------------------
  // Properties
  public defaultDuration = 4000;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(public toastController: ToastController) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function presentToast
   * This Method is used to display the toast
   */
  public async presentToast(message: string, isSuccess: boolean = false, customDuration?: number, isDefault: boolean = false) {
    const toast = await this.toastController.create({
      message,
      duration: customDuration
        ? customDuration
        : this.defaultDuration,
      color: isDefault ? null : isSuccess ? TOAST_TYPE.SUCCESS : TOAST_TYPE.ERROR
    });
    toast.present();
    return new Promise((resolve) => {
      toast.onDidDismiss().then((value) => {
        if (value.role === 'cancel') {
          resolve(value);
        }
      });
    });
  }
}
