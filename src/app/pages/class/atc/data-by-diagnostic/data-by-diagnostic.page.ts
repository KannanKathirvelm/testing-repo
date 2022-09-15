import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@constants/router-constants';
import { IonSelect } from '@ionic/angular';
import { DiagnosticDetailModel, DomainModel } from '@models/atc/atc';
import { ClassModel } from '@models/class/class';
import { TranslateService } from '@ngx-translate/core';
import { ATCService } from '@providers/service/atc/atc.service';
import { ClassService } from '@providers/service/class/class.service';
import * as moment from 'moment';

@Component({
  selector: 'data-by-diagnostic',
  templateUrl: './data-by-diagnostic.page.html',
  styleUrls: ['./data-by-diagnostic.page.scss'],
})
export class DataByDiagnosticPage implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @ViewChild('domainSelect') public selectRef: IonSelect;
  public classDetails: ClassModel;
  public searchText: string;
  public diagnosticSummary: DiagnosticDetailModel;
  public selectedMilestone: DomainModel
  public milestoneSelectHeader: { header: string };

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private classService: ClassService,
    private atcService: ATCService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.milestoneSelectHeader = {
      header: this.translate.instant('MILESTONES')
    }
  }

  // -------------------------------------------------------------------------
  // Life Cycle methods
  public ngOnInit() {
    this.classDetails = this.classService.class;
  }

  public ionViewDidEnter() {
    this.getAtcDiagnosticDetails();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getAtcDiagnosticDetails
   * This Method is used to fetch CA performance
   */
  public getAtcDiagnosticDetails() {
    const classId = this.classDetails.id;
    const fromDate = moment(this.classDetails.createdAt).format('YYYY-MM-DD');
    const toDate = moment(this.classDetails.updatedAt).format('YYYY-MM-DD');
    this.atcService.getAtcDiagnosticDetails(classId, fromDate, toDate).then((diagnostic) => {
      this.diagnosticSummary = diagnostic;
      this.setSelectedMilestone(this.diagnosticSummary.domains[0].sequenceId);
    });
  }

  public onSelectMilestone(event) {
    const sequenceId = event.detail.value;
    this.setSelectedMilestone(sequenceId);
  }

  public setSelectedMilestone(sequenceId) {
    this.selectedMilestone = this.diagnosticSummary.domains.find((item) => item.sequenceId === sequenceId);
  }

  public openMilestoneList() {
    this.selectRef.open();
  }

  /**
   * @function navigateToAtcPage
   * This method is used to navigate to atc page
   */
  public navigateToAtcPage() {
    const atcURL = routerPathIdReplace('atc', this.classDetails.id);
    this.router.navigate([atcURL]);
  }

  /**
   * @function filterStudentList
   * This method is used to filter student list
   */
  public filterStudentList(event) {
    const searchTerm = event.srcElement.value;
    this.searchText = searchTerm;
  }

}
