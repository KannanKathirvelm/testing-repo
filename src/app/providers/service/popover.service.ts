import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Injectable()
export class PopoverService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    public popoverController: PopoverController
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function presentPopover
   * This Method is used to present popover
   */
  public async presentPopover(component, event, componentProps, cssClassName?) {
    const popover = await this.popoverController.create({
      component,
      cssClass: cssClassName,
      translucent: true,
      showBackdrop: false,
      event,
      componentProps
    });
    await popover.present();
  }

  /**
   * @function dismissPopover
   * This Method is used to dismiss popover
   */
  public dismissPopover() {
    this.popoverController.dismiss();
  }
}
