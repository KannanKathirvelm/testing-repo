import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformPerformanceScore'
})
export class TransformPerformanceScorePipe implements PipeTransform {
  public transform(performance) {
    let performanceScore;
    if (typeof performance === 'undefined' || performance === null) {
      performanceScore = '---';
    } else {
      // tslint:disable-next-line
      performanceScore = `${~~performance}%`;
    }
    return performanceScore;
  }
}
