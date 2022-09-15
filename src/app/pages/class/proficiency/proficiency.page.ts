import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClassService } from '@providers/service/class/class.service';

@Component({
  selector: 'app-proficiency',
  templateUrl: './proficiency.page.html',
  styleUrls: ['./proficiency.page.scss'],
})

export class ProficiencyPage {

  // -------------------------------------------------------------------------
  // Properties

  public isShowProficiencyView: boolean;
  public isPremiumClass: boolean;
  public isFromATC: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private activatedRoute: ActivatedRoute
  ) {
  }


  // -------------------------------------------------------------------------
  // Lifecycle methods

  public ionViewDidEnter() {
    this.isFromATC = this.activatedRoute.snapshot.queryParams
      ? this.activatedRoute.snapshot.queryParams.isFromATC
      : false;
    const classDetails = this.classService.class;
    this.isPremiumClass = classDetails.isPremiumClass;
    this.isShowProficiencyView = !!classDetails.courseId;
  }
}
