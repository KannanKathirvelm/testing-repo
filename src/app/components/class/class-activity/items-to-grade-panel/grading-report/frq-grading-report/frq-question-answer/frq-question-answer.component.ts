import { Component, Input } from '@angular/core';
import { FrqQuestionAnswerModel } from '@models/rubric/rubric';

@Component({
  selector: 'nav-frq-question-answer',
  templateUrl: './frq-question-answer.component.html',
  styleUrls: ['./frq-question-answer.component.scss'],
})
export class FrqQuestionAnswerComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public questionAnswerContent: FrqQuestionAnswerModel;

}
