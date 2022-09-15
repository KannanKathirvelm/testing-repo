import { Component } from '@angular/core';

@Component({
  selector: 'lesson-plan',
  templateUrl: './lesson-plan.component.html',
  styleUrls: ['./lesson-plan.component.scss'],
})
export class LessonPlanComponent {

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
