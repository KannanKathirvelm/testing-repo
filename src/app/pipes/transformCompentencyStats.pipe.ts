import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'transformCompetencyStats' })
export class TransformCompetencyStats implements PipeTransform {
  public transform(completedCompetencies, totalCompetencies) {
    const score = (completedCompetencies / totalCompetencies) * 100;
    return `${score}%`;
  }
}
