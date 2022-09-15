import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-class-activities',
  templateUrl: './class-activities.page.html',
  styleUrls: ['./class-activities.page.scss'],
})
export class ClassActivitiesPage {

  // -------------------------------------------------------------------------
  // Properties

  public classId: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
    this.classId = this.activatedRoute.snapshot.params.id;
  }
}
