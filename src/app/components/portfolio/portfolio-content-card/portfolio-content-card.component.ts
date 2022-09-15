import { Component, Input } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ASSESSMENT, COLLECTION } from '@app/constants/helper-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { ClassModel } from '@models/class/class';
import { PortfolioModel } from '@models/portfolio/portfolio';
import { ClassService } from '@providers/service/class/class.service';
import { ReportService } from '@providers/service/report/report.service';

@Component({
  selector: 'portfolio-content-card',
  templateUrl: './portfolio-content-card.component.html',
  styleUrls: ['./portfolio-content-card.component.scss'],
})
export class PortfolioContentCardComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activity: PortfolioModel;
  @Input() public userId: string;
  public class: ClassModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private classService: ClassService, private reportService: ReportService, private parseService: ParseService) {
    this.class = this.classService.class;
  }

  /**
   * @function showReport
   * This method used to call report function based on type
   */
  public showReport(isPreview?) {
    const performance = {
      id: this.activity.id,
      score: this.activity.score,
      timeSpent: this.activity.timespent,
      type: this.activity.type,
      sessionId: this.activity.lastSessionId
    };
    const context = {
      collectionType: this.activity.type,
      collectionId: this.activity.id,
      sessionId: this.activity.lastSessionId,
      contentSource: this.activity.contentSource,
      studentId: this.userId,
      classId: this.class.id,
      performance,
      isPreview,
      isClassProgressReport: true
    };
    this.reportService.showReport(context);
    if (!isPreview) {
      switch (this.activity.type ) {
        case ASSESSMENT:
          this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_GRADE_RANGE_ASSESSMENT);
        break;
        case COLLECTION:
          this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_GRADE_RANGE_COLLECTION);
        break;
      }
    }
  }

  /**
   * @function onPreview
   * This method used to preview collections
   */
  public onPreview() {
    this.showReport(true);
  }
}
