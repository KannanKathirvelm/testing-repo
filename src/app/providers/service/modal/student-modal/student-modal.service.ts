import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable()
export class StudentModalService {

  // -------------------------------------------------------------------------
  // Properties

  public modal: any;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalCtrl: ModalController
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function openModal
   * This Method is used to open modal
   */
  public async openModal(component, props, className?) {
    if (!this.modal) {
      this.modal = await this.modalCtrl.create({
        component,
        componentProps: props,
        cssClass: className,
        backdropDismiss: true
      });
      await this.modal.present();
      return new Promise((resolve, reject) => {
        this.modal.onDidDismiss().then((response) => {
          resolve(response.data);
        });
      });
    }
  }

  /**
   * @function dismissModal
   * This Method is used to dismiss the model
   */
  public dismissModal(context?) {
    if (this.modal) {
      this.modal = null;
      this.modalCtrl.dismiss(context);
    }
  }
}
