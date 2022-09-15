import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SearchCompetencyModel, SignatureContentModel } from '@models/signature-content/signature-content';
@Component({
  selector: 'learning-map-panel',
  templateUrl: './learning-map-panel.component.html',
  styleUrls: ['./learning-map-panel.component.scss'],
})
export class LearningMapPanelComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public learningMapData: SearchCompetencyModel;
  @Output() public clickLearningMap: EventEmitter<string> = new EventEmitter();
  public learningMapContent: Array<{ type: string; count: number }>;
  public signatureCollections: Array<SignatureContentModel>;
  public signatureAssessments: Array<SignatureContentModel>;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.loadData();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.learningMapData && !changes.learningMapData.firstChange) {
      this.loadData();
    }
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  private loadData() {
    const learningMapData = this.learningMapData;
    this.signatureCollections = learningMapData.signatureContents.collections;
    this.signatureAssessments = learningMapData.signatureContents.assessments;
    this.learningMapContent = [];
    learningMapData.learningMapsContent.forEach((data) => {
      const content = {
        type: data.type,
        count: data.totalHitCount
      };
      this.learningMapContent.push(content);
    });
  }

  /**
   * @function onClickLearningMap
   * This method is trigger when user click the learning map content
   */
  public onClickLearningMap(content) {
    if (content.count > 0) {
      this.clickLearningMap.emit(content.type);
    }
  }
}
