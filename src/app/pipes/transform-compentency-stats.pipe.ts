import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'transformCompentencyStats' })
export class TransformCompentencyStats implements PipeTransform {
  public transform(completedCompetencies, totalCompetencies) {
    completedCompetencies = completedCompetencies === null ? 0 : completedCompetencies;
    return `${completedCompetencies}/${totalCompetencies}`;
  }
}
