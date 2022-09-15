import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@constants/router-constants';
import { DiagnosticDetailModel } from '@models/atc/atc';
import { ClassModel } from '@models/class/class';

@Component({
  selector: 'atc-diagnostic-report',
  templateUrl: './atc-diagnostic-report.component.html',
  styleUrls: ['./atc-diagnostic-report.component.scss'],
})
export class AtcDiagnosticReportComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public diagnosticSummary: DiagnosticDetailModel;
  @Input() public classDetail: ClassModel;
  public diagnosticReportCount: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    let diagnosticCount = [];
    this.diagnosticSummary.domains.map(domain => {
      diagnosticCount = diagnosticCount.concat(
        domain.students ? domain.students.map((student) => student.id) : []
      );
    });
    this.diagnosticReportCount = [...new Set(diagnosticCount)].length;
  }

  public navigateToDataByDiagnosticPage() {
    const dataByMilestone = routerPathIdReplace('dataByDiagnostic', this.classDetail.id);
    this.router.navigate([dataByMilestone]);
  }
}
