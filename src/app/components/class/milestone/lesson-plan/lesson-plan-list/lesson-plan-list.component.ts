import { Component } from '@angular/core';

@Component({
  selector: 'lesson-plan-list',
  templateUrl: './lesson-plan-list.component.html',
  styleUrls: ['./lesson-plan-list.component.scss'],
})
export class LessonPlanListsComponent {

  // -------------------------------------------------------------------------
  // Properties

  public priorPanelState: boolean;
  public questionPanelState: boolean;
  public anticipatedPanelState: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor() {
    this.priorPanelState = false;
    this.questionPanelState = false;
    this.anticipatedPanelState = false;
  }
}
