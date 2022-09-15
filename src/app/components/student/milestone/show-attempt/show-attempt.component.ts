import { Component, Input } from '@angular/core';
import { CollectionModel } from '@models/collection/collection';
import { PortfolioActivityAttempt } from '@models/portfolio/portfolio';

@Component({
  selector: 'show-attempt',
  templateUrl: './show-attempt.component.html',
  styleUrls: ['./show-attempt.component.scss'],
})

export class ShowAttemptComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activityAttempts: Array<PortfolioActivityAttempt>;
  @Input() public isCurrentSuggestedCollection: boolean;
  @Input() public isNextSuggestedCollection: boolean;
  @Input() public isNextTeacherSuggested: boolean;
  @Input() public isNextSystemSuggested: boolean;
  @Input() public isCurrentTeacherSuggested: boolean;
  @Input() public isCurrentSystemSuggested: boolean;
  @Input() public isLastCollectionInMilestone: boolean;
  @Input() public collection: CollectionModel;
}
