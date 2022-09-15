import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SubjectModel } from '@models/taxonomy/taxonomy';

@Component({
  selector: 'legend-pull-up',
  templateUrl: './legend-pull-up.component.html',
  styleUrls: ['./legend-pull-up.component.scss'],
})
export class LegendPullUpComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activeSubject: SubjectModel;
  public translateParam: { subject: string };

  constructor(private modalController: ModalController) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    if (this.activeSubject) {
      const subject = this.activeSubject.title;
      this.translateParam = { subject };
    }
  }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose() {
    this.modalController.dismiss();
  }
}
