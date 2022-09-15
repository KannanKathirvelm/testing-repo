import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { TaxonomyModel } from '@models/taxonomy/taxonomy';

@Component({
  selector: 'nav-taxonomy-popover',
  templateUrl: './taxonomy-popover.component.html',
  styleUrls: ['./taxonomy-popover.component.scss'],
})
export class TaxonomyPopoverComponent {

  // -------------------------------------------------------------------------
  // Properties

  public taxonomyList: Array<TaxonomyModel>;
  public showFrameworkInfo: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private navParams: NavParams) {
    this.taxonomyList = this.navParams.get('taxonomyList');
    this.showFrameworkInfo = this.navParams.get('showFrameworkInfo');
  }
}
