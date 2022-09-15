import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'transformDomainPercentage' })
export class TransformDomainPercentagePipe implements PipeTransform {
  public transform(totalCoverage, coverage) {
    let percentage = 0;
    if (totalCoverage && coverage) {
      percentage = totalCoverage && coverage ? (coverage / totalCoverage) * 100 : 0;
    }
    // tslint:disable-next-line
    return `${~~percentage}%`;
  }
}
